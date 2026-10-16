import nextEnv from '@next/env';
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

nextEnv.loadEnvConfig(process.cwd());
const project = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!project || !key) throw new Error('Set your public Supabase URL and key in .env.local first.');

const port = 3300;
const origin = `http://127.0.0.1:${port}`;
await new Promise((resolve, reject) => {
  const probe = createServer();
  probe.once('error', () => reject(new Error(`Port ${port} is already in use.`)));
  probe.listen(port, '127.0.0.1', () => probe.close(resolve));
});
const tsconfig = '.tsconfig-playwright-live.json';
await writeFile(tsconfig, JSON.stringify({ extends: './tsconfig.json',
  include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next-playwright-live/types/**/*.ts'],
  exclude: ['node_modules', 'supabase/functions'] }, null, 2));
const server = spawn(process.execPath, [path.resolve('node_modules/next/dist/bin/next'), 'dev', '--hostname', '127.0.0.1', '--port', String(port)], {
  windowsHide: true, shell: false, stdio: ['ignore', 'pipe', 'pipe'],
  env: { ...process.env, NEXT_DIST_DIR: '.next-playwright-live', NEXT_TSCONFIG_PATH: tsconfig,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: '', NEXT_PUBLIC_ADSENSE_CLIENT: '' },
});
let logs = '';
let launchError;
server.stdout.on('data', chunk => { logs = (logs + chunk).slice(-4000); });
server.stderr.on('data', chunk => { logs = (logs + chunk).slice(-4000); });
server.on('error', error => { launchError = error; });
let browser;
try {
  let ready = false;
  const deadline = Date.now() + 180_000;
  while (Date.now() < deadline) {
    if (launchError) throw launchError;
    if (server.exitCode !== null) throw new Error(`Local server exited: ${logs}`);
    try { ready = (await fetch(origin, { signal: AbortSignal.timeout(5000) })).ok; } catch { /* Starting. */ }
    if (ready) break;
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  if (!ready) throw new Error(`Local server was not ready: ${logs}`);
  const response = await fetch(`${project}/rest/v1/invitations?select=slug&published=eq.true&limit=1`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`Cannot read published links (HTTP ${response.status}).`);
  const rows = await response.json();
  if (!rows.length) throw new Error('No published invitation exists to verify. Publish one with a test account first.');
  browser = await chromium.launch({ headless: !process.argv.includes('--headed'), slowMo: 250 });
  const videoDir = path.resolve('test-videos/live-supabase', new Date().toISOString().replace(/[:.]/g, '-'));
  await mkdir(videoDir, { recursive: true });
  for (let visitor = 1; visitor <= 2; visitor++) {
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, reducedMotion: 'reduce',
      recordVideo: { dir: videoDir, size: { width: 1920, height: 1080 } } });
    try {
      const page = await context.newPage();
      page.setDefaultTimeout(30_000);
      await page.goto(`${origin}/i/${encodeURIComponent(rows[0].slug)}`);
      await page.getByRole('button', { name: 'Open Invitation', exact: true }).click();
      await page.locator('#venue').waitFor({ state: 'visible' });
      console.log(`PASS: Existing real Supabase invitation opens without login in fresh browser ${visitor}.`);
      const documents = await page.evaluate(async () => ({
        localKeys: Object.keys(localStorage).filter(name => name.startsWith('invitra:')),
        databases: (await indexedDB.databases()).map(database => database.name),
      }));
      if (documents.localKeys.length || documents.databases.length) throw new Error('Invitation data was saved in browser storage.');
      await page.goto(`${origin}/create`);
      await page.getByRole('heading', { name: 'Sign in to create invitations' }).waitFor();
      console.log(`PASS: Local builder requires login in fresh browser ${visitor}.`);
      const recording = page.video();
      await context.close();
      console.log(`Full HD video: ${await recording.path()}`);
    } finally { await context.close(); }
  }
  console.log('Read-only live verification completed. No accounts, invitations or guest responses were created or changed.');
  console.log('Account signup/confirmation, saving, uploading and new publishing still require a real test account and the new database migration.');
} finally {
  await browser?.close();
  if (process.platform === 'win32' && server.pid && server.exitCode === null) {
    await new Promise(resolve => {
      const cleanup = spawn('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command',
        `function Stop-TestTree([int]$targetPid) { Get-CimInstance Win32_Process -Filter "ParentProcessId=$targetPid" | ForEach-Object { Stop-TestTree $_.ProcessId }; Stop-Process -Id $targetPid -Force -ErrorAction SilentlyContinue }; Stop-TestTree ${server.pid}`],
      { windowsHide: true, shell: false, stdio: 'ignore' });
      cleanup.on('error', () => { server.kill(); resolve(); });
      cleanup.on('exit', resolve);
    });
  } else server.kill('SIGTERM');
}
