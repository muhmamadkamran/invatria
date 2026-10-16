import { spawn, type ChildProcess } from 'node:child_process';
import { createServer } from 'node:net';
import path from 'node:path';
import { writeFile } from 'node:fs/promises';
import type { FullConfig } from '@playwright/test';
import { startSupabaseMock } from './support/supabase-mock';

// Spawn Node directly: Playwright's webServer uses cmd.exe on Windows,
// which is missing on some managed machines.
export default async function setup(config: FullConfig, mode: 'development' | 'production' = 'development') {
  const origin = config.projects[0].use.baseURL ?? 'http://127.0.0.1:3100';
  const port = Number(new URL(origin).port);
  await new Promise<void>((resolve, reject) => {
    const probe = createServer();
    probe.once('error', () => reject(new Error(`Port ${port} is in use. Close the previous test server first.`)));
    probe.listen(port, '127.0.0.1', () => probe.close(() => resolve()));
  });
  const backend = await startSupabaseMock();
  const distDir = `.next-playwright-${port}`;
  const testTsconfig = `.tsconfig-playwright-${port}.json`;
  // Next updates its TypeScript config for a custom distDir. Keep that change
  // in an ignored test config instead of modifying the checked-in tsconfig.
  await writeFile(path.resolve(testTsconfig), JSON.stringify({
    extends: './tsconfig.json',
    include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', `${distDir}/types/**/*.ts`],
    exclude: ['node_modules', 'supabase/functions'],
  }, null, 2) + '\n');
  // Browser and SSR traffic go to the same disposable backend. Never inherit
  // real credentials from .env.local or the developer's shell.
  process.env.E2E_SUPABASE_URL = backend.origin;
  const env: NodeJS.ProcessEnv = {
      ...process.env,
      NEXT_DIST_DIR: distDir,
      NEXT_TSCONFIG_PATH: testTsconfig,
      NEXT_PUBLIC_SUPABASE_URL: backend.origin,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'playwright-mock-anon-key',
      SUPABASE_URL: backend.origin,
      SUPABASE_ANON_KEY: 'playwright-mock-anon-key',
      SUPABASE_SERVICE_ROLE_KEY: '',
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: '',
      NEXT_PUBLIC_ADSENSE_CLIENT: '',
      ...(mode === 'production' ? { NODE_ENV: 'production' as const } : {}),
  };
  const next = path.resolve('node_modules/next/dist/bin/next');
  if (mode === 'production') {
    process.stdout.write('Building isolated production app against the disposable Supabase backend...\n');
    const build = spawn(process.execPath, [next, 'build'], {
      shell: false, windowsHide: true, env, stdio: ['ignore', 'pipe', 'pipe'],
    });
    let buildOutput = '';
    build.stdout?.on('data', data => { buildOutput = (buildOutput + data).slice(-12_000); });
    build.stderr?.on('data', data => { buildOutput = (buildOutput + data).slice(-12_000); });
    try {
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error(`Production test build timed out: ${buildOutput}`)), 180_000);
        build.once('error', error => { clearTimeout(timeout); reject(error); });
        build.once('exit', code => {
          clearTimeout(timeout);
          if (code === 0) resolve();
          else reject(new Error(`Production test build failed (${code}): ${buildOutput}`));
        });
      });
    } catch (error) {
      await stopProcessTree(build);
      await backend.close();
      throw error;
    }
  }
  const child = spawn(process.execPath, [
    next, mode === 'production' ? 'start' : 'dev',
    '--hostname', '127.0.0.1', '--port', String(port),
  ], {
    shell: false,
    windowsHide: true,
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  let failure: Error | undefined;
  child.stdout?.on('data', data => { output = (output + data).slice(-8000); });
  child.stderr?.on('data', data => { output = (output + data).slice(-8000); });
  child.on('error', error => { failure = error; });
  const stop = async () => {
    await backend.close();
    await stopProcessTree(child);
  };
  try {
    const deadline = Date.now() + 180_000;
    while (Date.now() < deadline) {
      if (failure) throw failure;
      if (child.exitCode !== null) throw new Error(`Test server exited: ${output}`);
      try {
        const response = await fetch(origin, { signal: AbortSignal.timeout(5000) });
        if (response.ok) return stop;
      } catch { /* Wait for the server to become ready. */ }
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    throw new Error(`Test server did not become ready: ${output}`);
  } catch (error) {
    await stop();
    throw error;
  }
}

async function stopProcessTree(child: ChildProcess) {
  if (child.exitCode !== null || !child.pid) return;
  // Next CLI forks a server; stop the complete tree on Windows.
  if (process.platform === 'win32') {
    await new Promise<void>((resolve) => {
      const killer = spawn('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command',
        `$parentPid = ${child.pid}; function Stop-Tree([int]$targetPid) { Get-CimInstance Win32_Process -Filter "ParentProcessId=$targetPid" | ForEach-Object { Stop-Tree $_.ProcessId }; Stop-Process -Id $targetPid -Force -ErrorAction SilentlyContinue }; Stop-Tree $parentPid`],
      { shell: false, windowsHide: true, stdio: 'ignore' });
      killer.on('error', () => { child.kill(); resolve(); });
      killer.on('exit', () => resolve());
    });
  } else child.kill('SIGTERM');
}
