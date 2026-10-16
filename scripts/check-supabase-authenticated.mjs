import nextEnv from '@next/env';
import { createClient } from '@supabase/supabase-js';
import { chromium, expect as playwrightExpect } from '@playwright/test';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { mkdir, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

const expect = playwrightExpect.configure({ timeout: 45_000 });

// REAL integration check: creates one clearly labelled test invitation,
// uploads its cover, and submits test guest responses. Records are retained.
// Run only with an account/project you are authorized to test.
// --headed: show the browser. --preflight-only: Auth check without app records.
// --resume=<UUID>: verify an existing Test invitation without new records.
// Localhost:3000 is the default; HOST/PORT overrides must match deployed CORS.
nextEnv.loadEnvConfig(process.cwd());
const project = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const email = process.env.SUPABASE_TEST_EMAIL;
const password = process.env.SUPABASE_TEST_PASSWORD;
const expectedUser = process.env.SUPABASE_TEST_USER_ID;
const port = Number(process.env.SUPABASE_LIVE_TEST_PORT ?? '3000');
const hostname = process.env.SUPABASE_LIVE_TEST_HOST ?? 'localhost';
const origin = `http://${hostname}:${port}`;
const secrets = [key, email, password].filter(Boolean);
let stage = 'configuration';
let server;
let browser;
let invitationId;
let publishedSlug;
let lastSubmissionStatus;
let serverLogs = '';
const contexts = [];
const resumeId = process.argv.find(arg => arg.startsWith('--resume='))?.slice('--resume='.length);
const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const videoDir = path.resolve('test-videos/live-supabase-authenticated', new Date().toISOString().replace(/[:.]/g, '-'));

function safe(message) {
  let clean = String(message);
  for (const secret of secrets) clean = clean.split(secret).join('[redacted]');
  return clean.replace(/\beyJ[\w-]+\.[\w-]+\.[\w-]+\b/g, '[redacted-token]');
}

function pass(message) { console.log(`PASS: ${message}`); }

async function noLocalDocuments(page) {
  const stored = await page.evaluate(async () => ({
    keys: Object.keys(localStorage).filter(name => name.startsWith('invitra:')),
    databases: (await indexedDB.databases()).map(database => database.name),
  }));
  if (stored.keys.length || stored.databases.length) throw new Error('Application documents appeared in localStorage or IndexedDB.');
}

async function newPage(role) {
  const context = await browser.newContext({
    baseURL: origin, viewport: { width: 1920, height: 1080 }, reducedMotion: 'reduce',
    colorScheme: 'light', timezoneId: 'Asia/Karachi',
    recordVideo: { dir: videoDir, size: { width: 1920, height: 1080 } },
  });
  const page = await context.newPage();
  page.setDefaultTimeout(45_000);
  page.setDefaultNavigationTimeout(90_000);
  contexts.push({ context, page, role, video: page.video() });
  return page;
}

async function signIn(page) {
  await page.goto('/my-invitations');
  await page.locator('main').getByRole('button', { name: 'Sign in', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Welcome back' });
  await expect(dialog.getByLabel('Email', { exact: true })).toBeFocused();
  await dialog.getByLabel('Email', { exact: true }).fill(email);
  await dialog.getByLabel('Password', { exact: true }).fill(password);
  await dialog.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(dialog).toBeHidden({ timeout: 45_000 });
  await expect(page.getByRole('heading', { name: /^My invitations$/i })).toBeVisible();
}

async function submitAndVerifyResponse(page, button) {
  const pending = page.waitForResponse(response => response.url().includes('/functions/v1/submit-response') && response.request().method() === 'POST');
  await button.click();
  const response = await pending;
  lastSubmissionStatus = response.status();
  let result;
  try { result = await response.json(); } catch { throw new Error(`Guest function returned non-JSON HTTP ${response.status()}.`); }
  if (!response.ok()) throw new Error(`Guest function returned HTTP ${response.status()}: ${result?.error ?? 'submission rejected'}`);
  if (!/^[0-9a-f-]{36}$/i.test(result?.id ?? '') || typeof result?.createdAt !== 'string' || !Number.isFinite(Date.parse(result.createdAt))) {
    throw new Error('Guest function returned HTTP success without the required saved record id and creation timestamp.');
  }
}

async function verifyResponseRows(sb, guestEmail, guestNote) {
  stage = 'real owner response read verification';
  let replies;
  let notes;
  try {
    await expect.poll(async () => {
      [replies, notes] = await Promise.all([
        sb.from('rsvps').select('id').eq('invitation_id', invitationId).eq('email', guestEmail),
        sb.from('guest_messages').select('id').eq('invitation_id', invitationId).eq('message', guestNote),
      ]);
      return { replies: replies.data?.length ?? 0, notes: notes.data?.length ?? 0,
        errors: [replies.error?.code, notes.error?.code].filter(Boolean) };
    }, { timeout: 15_000, intervals: [300, 1000, 2000] }).toEqual({ replies: 1, notes: 1, errors: [] });
  } catch { /* Report safe count/error diagnostics below. */ }
  if (replies?.error || notes?.error || replies?.data?.length !== 1 || notes?.data?.length !== 1) {
    const describe = result => result?.error ? `${result.error.code ?? 'error'}: ${result.error.message}` : `${result?.data?.length ?? 0} matching rows`;
    throw new Error(`Owner response verification failed; RSVP: ${describe(replies)}; guest book: ${describe(notes)}.`);
  }
}

async function verifyHostViews(host, hostName, guestEmail, guestNote, coverUrl) {
  stage = 'host dashboard and management';
  await host.goto('/my-invitations');
  const card = host.locator('li').filter({ has: host.getByRole('heading', { name: `${hostName} & Test Partner`, exact: true }) });
  await expect(card.getByText('Live', { exact: true })).toBeVisible();
  await expect(card.getByText(/1 attending.*1 replies/)).toBeVisible();
  await expect(card.getByText('1 notes', { exact: true })).toBeVisible();
  await card.getByRole('link', { name: 'Manage', exact: true }).click();
  await expect(host).toHaveURL(`${origin}/my-invitations/${invitationId}`);
  await expect(host.getByText(guestEmail, { exact: true })).toBeVisible();
  await expect(host.getByText(guestNote, { exact: true })).toBeVisible();
  await noLocalDocuments(host);
  pass('Host dashboard and management show real guest responses.');

  stage = 'same account in a second independent browser';
  const second = await newPage('second-device');
  await signIn(second);
  await second.goto(`/create?draft=${invitationId}`);
  const secondMain = second.locator('main');
  await secondMain.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(secondMain.getByRole('img', { name: 'Cover', exact: true })).toHaveAttribute('src', coverUrl);
  await secondMain.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(secondMain.locator('#host1')).toHaveValue(hostName);
  await noLocalDocuments(second);
  pass('Same account resumes its real invitation and cover from another browser without local documents.');
  console.log(`Real test invitation retained for review: /i/${publishedSlug}`);
  console.log(`Invitation id: ${invitationId}`);
  console.log('The localhost frontend must be running to open this relative link. A publicly deployed frontend is required for sharing with other devices.');
}

async function stopServer() {
  if (!server?.pid || server.exitCode !== null) return;
  if (process.platform !== 'win32') { server.kill('SIGTERM'); return; }
  await new Promise(resolve => {
    const cleanup = spawn('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command',
      `function Stop-LiveTestTree([int]$targetPid) { Get-CimInstance Win32_Process -Filter "ParentProcessId=$targetPid" | ForEach-Object { Stop-LiveTestTree $_.ProcessId }; Stop-Process -Id $targetPid -Force -ErrorAction SilentlyContinue }; Stop-LiveTestTree ${server.pid}`],
    { windowsHide: true, shell: false, stdio: 'ignore' });
    cleanup.on('error', () => { server.kill(); resolve(); });
    cleanup.on('exit', resolve);
  });
}

async function main() {
  if (!project || !key || !email || !password) throw new Error('Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_TEST_EMAIL and SUPABASE_TEST_PASSWORD in ignored .env.local.');
  if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('SUPABASE_LIVE_TEST_PORT must be an available port between 1024 and 65535.');
  if (!['localhost', '127.0.0.1'].includes(hostname)) throw new Error('SUPABASE_LIVE_TEST_HOST must be localhost or 127.0.0.1.');

  stage = 'real account preflight';
  const sb = createClient(project, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) {
    if (/email.*not.*confirmed/i.test(error.message) || error.code === 'email_not_confirmed') {
      console.error('BLOCKED: Confirm the test account email before running authenticated checks. No invitation or guest records were written.');
      process.exitCode = 2;
      return;
    }
    throw new Error(`Supabase sign-in failed: ${error.message}`);
  }
  if (!data.user || data.user.is_anonymous || !data.user.email_confirmed_at) throw new Error('Supabase did not return a confirmed registered test account.');
  if (expectedUser && data.user.id !== expectedUser) throw new Error('The signed-in account does not match SUPABASE_TEST_USER_ID; no invitation was created.');
  secrets.push(data.session.access_token, data.session.refresh_token);
  pass('Real registered account sign-in and email confirmation.');
  if (process.argv.includes('--preflight-only')) return;

  stage = 'guest function CORS preflight';
  const cors = await fetch(`${project.replace(/\/$/, '')}/functions/v1/submit-response`, {
    method: 'OPTIONS', headers: { Origin: origin, 'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'authorization,apikey,content-type,x-client-info' },
    signal: AbortSignal.timeout(15_000),
  });
  const allowedOrigin = cors.headers.get('access-control-allow-origin');
  if (!cors.ok || ![origin, '*'].includes(allowedOrigin)) throw new Error(`The deployed guest function permits ${allowedOrigin ?? 'no frontend origin'}, while this check uses ${origin}. Run on an allowed local origin or update the function CORS configuration before creating test records.`);
  pass(`Guest function CORS accepts ${origin}.`);

  stage = 'isolated local frontend startup';
  await new Promise((resolve, reject) => {
    const probe = createServer();
    probe.once('error', () => reject(new Error(`Port ${port} is already in use. Close the existing server or choose another origin already allowed by the deployed guest function.`)));
    probe.listen(port, hostname, () => probe.close(resolve));
  });
  const distDir = `.next-playwright-authenticated-${port}`;
  const tsconfig = `.tsconfig-playwright-authenticated-${port}.json`;
  await writeFile(tsconfig, JSON.stringify({ extends: './tsconfig.json',
    include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', `${distDir}/types/**/*.ts`],
    exclude: ['node_modules', 'supabase/functions'] }, null, 2));
  server = spawn(process.execPath, [path.resolve('node_modules/next/dist/bin/next'), 'dev', '--hostname', hostname, '--port', String(port)], {
    windowsHide: true, shell: false, stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, NEXT_DIST_DIR: distDir, NEXT_TSCONFIG_PATH: tsconfig,
      NEXT_PUBLIC_SUPABASE_URL: project, NEXT_PUBLIC_SUPABASE_ANON_KEY: key,
      NEXT_PUBLIC_ADSENSE_CLIENT: '', SUPABASE_SERVICE_ROLE_KEY: '' },
  });
  let launchError;
  server.stdout.on('data', chunk => { serverLogs = (serverLogs + chunk).slice(-6000); });
  server.stderr.on('data', chunk => { serverLogs = (serverLogs + chunk).slice(-6000); });
  server.on('error', error => { launchError = error; });
  let ready = false;
  const deadline = Date.now() + 180_000;
  while (Date.now() < deadline) {
    if (launchError) throw launchError;
    if (server.exitCode !== null) throw new Error(`Local test server exited: ${safe(serverLogs)}`);
    try { ready = (await fetch(`${origin}/my-invitations`, { signal: AbortSignal.timeout(5000) })).ok; } catch { /* Starting. */ }
    if (ready) break;
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  if (!ready) throw new Error(`Local test server did not become ready: ${safe(serverLogs)}`);
  await mkdir(videoDir, { recursive: true });
  browser = await chromium.launch({ headless: !process.argv.includes('--headed'), slowMo: 150 });

  stage = 'browser sign-in';
  const host = await newPage('host');
  await signIn(host);
  pass('Frontend login using real Supabase Auth.');
  if (resumeId) {
    stage = 'resuming an existing owned test invitation';
    if (!/^[0-9a-f-]{36}$/i.test(resumeId)) throw new Error('--resume must identify a test invitation UUID.');
    const { data: existing, error: existingError } = await sb.from('invitations').select('*').eq('id', resumeId).eq('owner_id', data.user.id).single();
    if (existingError) throw new Error(`Could not resume the owned test invitation: ${existingError.message}`);
    if (!existing.published || !existing.slug.startsWith('test-invitra-') || !existing.data.hostPrimary.startsWith('Test Invitra ')) throw new Error('--resume only supports published Test Invitra records created by this checker.');
    invitationId = existing.id;
    publishedSlug = existing.slug;
    const originalStamp = existing.slug.slice('test-invitra-'.length);
    const guestEmail = `guest-${originalStamp}@example.test`;
    const guestNote = `Automated live integration test ${originalStamp}. This is a test note.`;
    const coverUrl = existing.data.cover?.url;
    if (!coverUrl || new URL(coverUrl).origin !== new URL(project).origin) throw new Error('Existing test cover does not reference this Supabase project.');
    console.log('Resuming the existing Test invitation; no new invitations or guest responses will be created.');
    const guest = await newPage('guest');
    await guest.goto(`/i/${publishedSlug}`);
    await guest.getByRole('button', { name: 'Open Invitation', exact: true }).click();
    await expect(guest.locator('#venue')).toContainText('Test Venue - Automated Check');
    await expect(guest.locator(`img[src=${JSON.stringify(coverUrl)}]`).first()).toBeVisible();
    await expect(guest.locator('#guestbook ul').getByText(guestNote, { exact: true })).toBeVisible();
    await noLocalDocuments(guest);
    await verifyResponseRows(sb, guestEmail, guestNote);
    pass('Existing published link, remote cover and actual saved guest responses remain available.');
    await verifyHostViews(host, existing.data.hostPrimary, guestEmail, guestNote, coverUrl);
    return;
  }
  stage = 'fourteen builder steps and cloud photo upload';
  await host.goto('/create');
  const main = host.locator('main');
  const hostName = `Test Invitra ${stamp}`;
  const guestName = `Test Guest ${stamp}`;
  const guestEmail = `guest-${stamp}@example.test`;
  const guestNote = `Automated live integration test ${stamp}. This is a test note.`;
  const coverBytes = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64');
  const futureDate = new Date(Date.now() + 90 * 86400_000).toISOString().slice(0, 10);
  for (let step = 1; step <= 14; step++) {
    await expect(main.getByText(new RegExp(`^Step ${step} of 14`))).toBeVisible();
    if (step === 2) {
      await main.locator('input[type="file"]').setInputFiles({ name: 'test-cloud-cover.png', mimeType: 'image/png', buffer: coverBytes });
      await expect(main.getByRole('img', { name: 'Cover', exact: true })).toHaveAttribute('src', /\/storage\/v1\/object\/public\//);
    }
    if (step === 3) { await main.locator('#host1').fill(hostName); await main.locator('#host2').fill('Test Partner'); }
    if (step === 4) await main.getByLabel('Date', { exact: true }).fill(futureDate);
    if (step === 5) await main.getByLabel('Starts', { exact: true }).fill('18:30');
    if (step === 6) { await main.getByLabel('Venue name').fill('Test Venue - Automated Check'); await main.getByLabel('Full address').fill('Test address only - not a real event'); }
    if (step < 14) await main.getByRole('button', { name: step === 13 ? 'Publish' : 'Continue', exact: true }).click();
  }
  await expect(host.getByText('Saved', { exact: true })).toBeAttached({ timeout: 45_000 });
  invitationId = new URL(host.url()).searchParams.get('draft');
  if (!invitationId) throw new Error('Cloud autosave did not produce a resumable draft id.');
  await noLocalDocuments(host);
  pass('All fourteen steps, remote cover upload and cloud autosave; no local documents.');

  stage = 'real publishing';
  publishedSlug = `test-invitra-${stamp}`;
  await main.getByLabel('Custom link').fill(publishedSlug);
  await main.getByRole('button', { name: 'Publish invitation', exact: true }).click();
  await expect(main.getByRole('button', { name: 'Update the live link', exact: true })).toBeVisible({ timeout: 45_000 });
  const { data: stored, error: storedError } = await sb.from('invitations').select('*').eq('id', invitationId).eq('owner_id', data.user.id).single();
  if (storedError) throw new Error(`Cannot verify owner-scoped saved invitation: ${storedError.message}`);
  if (!stored.published || stored.slug !== publishedSlug || stored.data.hostPrimary !== hostName) throw new Error('Cloud invitation does not match the published UI state.');
  const coverUrl = stored.data.cover?.url;
  if (!coverUrl || new URL(coverUrl).origin !== new URL(project).origin || !new URL(coverUrl).pathname.startsWith('/storage/v1/object/public/')) throw new Error('Saved cover does not reference this Supabase project Storage.');
  pass('Published row persisted in real Supabase under the test account.');

  stage = 'independent signed-out guest link and cloud cover';
  const guest = await newPage('guest');
  await guest.goto(`/i/${publishedSlug}`);
  await guest.getByRole('button', { name: 'Open Invitation', exact: true }).click();
  await expect(guest.locator('#venue')).toContainText('Test Venue - Automated Check');
  const guestCover = guest.locator(`img[src=${JSON.stringify(coverUrl)}]`);
  await expect(guestCover.first()).toBeVisible();
  await expect.poll(() => guestCover.first().evaluate(img => img.complete && img.naturalWidth > 0)).toBeTruthy();
  const objectResponse = await guest.context().request.get(coverUrl);
  if (!objectResponse.ok() || !(await objectResponse.body()).equals(coverBytes)) throw new Error('An unauthenticated guest could not fetch the original cloud cover bytes.');
  await noLocalDocuments(guest);
  pass('Share link and original remote cover open in a separate signed-out browser.');

  stage = 'real guest RSVP and guest-book submission';
  guest.on('response', response => { if (response.url().includes('/functions/v1/submit-response')) lastSubmissionStatus = response.status(); });
  const rsvp = guest.locator('#rsvp');
  await rsvp.locator('#rsvp-name').fill(guestName);
  await rsvp.locator('#rsvp-email').fill(guestEmail);
  await submitAndVerifyResponse(guest, rsvp.getByRole('button', { name: 'Send RSVP', exact: true }));
  await expect(rsvp.getByText(/your reply has been recorded/)).toBeVisible({ timeout: 45_000 });
  const book = guest.locator('#guestbook');
  await book.locator('#gb-name').fill(guestName);
  await book.locator('#gb-body').fill(guestNote);
  await submitAndVerifyResponse(guest, book.getByRole('button', { name: 'Leave a note', exact: true }));
  await expect(book.locator('ul').getByText(guestNote, { exact: true })).toBeVisible({ timeout: 45_000 });
  await noLocalDocuments(guest);
  await verifyResponseRows(sb, guestEmail, guestNote);
  pass('Real Edge Function submissions persisted as owner-readable RSVP and guest-book records.');
  await verifyHostViews(host, hostName, guestEmail, guestNote, coverUrl);
}

try {
  await main();
} catch (error) {
  process.exitCode = 1;
  console.error(`FAIL at ${stage}: ${safe(error instanceof Error ? error.message : error)}`);
  if (server && (server.exitCode !== null || /ERR_EMPTY_RESPONSE|ECONNRESET|ECONNREFUSED/.test(String(error)))) console.error(`Local server diagnostics: ${safe(serverLogs)}`);
  if (stage.includes('upload')) console.error('Check Supabase Storage buckets/policies and browser upload errors. The existing database is not reset.');
  if (stage.includes('submission')) console.error(`Check the deployed submit-response function, CAPTCHA settings and allowed frontend origins${lastSubmissionStatus ? ` (last response HTTP ${lastSubmissionStatus})` : ''}.`);
  if (stage.includes('response read')) console.error('Guest HTTP success was observed. Check actual response-table columns, saved values and host SELECT policies before claiming the responses are available to the owner.');
  if (stage.includes('publishing') || stage.includes('cloud')) console.error('Check database migrations, registered-account policies and the browser save error. No records are deleted automatically.');
  if (invitationId) console.error(`Partial test invitation retained: ${invitationId}${publishedSlug ? `; requested link /i/${publishedSlug}` : ''}`);
  for (const { page, role } of contexts) {
    try { await page.screenshot({ path: path.join(videoDir, `${role}-failure.png`), fullPage: true, mask: [page.locator('input[type="password"]')] }); } catch { /* Keep the original failure. */ }
  }
} finally {
  for (const { context, video, role } of contexts) {
    try {
      await context.close();
      const destination = path.join(videoDir, `${role}.webm`);
      await rename(await video.path(), destination);
      console.log(`Full HD ${role} video: ${destination}`);
    } catch (error) { console.error(`Could not finalize ${role} video: ${safe(error.message)}`); }
  }
  await browser?.close();
  await stopServer();
}
