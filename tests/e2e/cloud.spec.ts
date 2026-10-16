import { randomUUID } from 'node:crypto';
import { test, expect, type Page, type APIRequestContext } from '@playwright/test';
import { blankInvitation } from '../../lib/defaults';
import { createAccount, login, mockOrigin, signInThroughUI, TEST_PASSWORD } from '../support/fixtures';
import type { InvitationRow } from '../../lib/supabase/types';

async function expectNoLocalDocuments(page: Page) {
  const stored = await page.evaluate(async () => ({
    keys: Object.keys(localStorage).filter(key => key.startsWith('invitra:')),
    databases: (await indexedDB.databases()).map(db => db.name),
  }));
  expect(stored.keys).toEqual([]);
  expect(stored.databases).toEqual([]);
}

async function seedInvitation(request: APIRequestContext, ownerId: string, name: string, published = false) {
  const inv = { ...blankInvitation(), id: randomUUID(), slug: `cloud-${randomUUID()}`, hostPrimary: name, published };
  const row: InvitationRow = { id: inv.id, slug: inv.slug, owner_id: ownerId, published,
    template_id: inv.templateId, category: inv.category, language: inv.language, data: inv,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  const result = await request.post(`${mockOrigin()}/__test/invitations`, { data: row });
  expect(result.ok()).toBeTruthy();
  return inv;
}

test('signed-out visitors must sign in before creating or viewing host data', async ({ page, request }) => {
  await page.goto('/create');
  await expect(page.getByRole('heading', { name: 'Sign in to create invitations' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continue', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Publish invitation|Publish without an account/ })).toHaveCount(0);
  await page.goto('/my-invitations');
  await expect(page.getByRole('heading', { name: 'Sign in to view your invitations' })).toBeVisible();
  await expectNoLocalDocuments(page);
  const requests = await (await request.get(`${mockOrigin()}/__test/requests`)).json() as { method: string; path: string; userId: string | null }[];
  expect(requests.filter(entry => entry.method === 'POST' && entry.path.startsWith('/rest/v1/invitations') && !entry.userId)).toEqual([]);
});

test('used signup links offer sign-in rather than password reset', async ({ page }) => {
  await page.goto('/auth/callback?next=/create#error=access_denied&error_code=otp_expired');
  await expect(page).toHaveURL(/\/create\?auth=link/);
  await expect(page.getByRole('heading', { name: 'Sign in to create invitations' })).toBeVisible();
  await expect(page.getByRole('status')).toContainText('If you confirmed your email, sign in');
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Send me a reset link' })).toHaveCount(0);
});

test('signup awaits email confirmation before unlocking cloud saving', async ({ page }) => {
  await page.goto('/create');
  await page.locator('main').getByRole('button', { name: 'Create an account', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByLabel('Email', { exact: true })).toBeFocused();
  await dialog.getByLabel('Email', { exact: true }).fill(`unconfirmed-${randomUUID()}@example.test`);
  await dialog.getByLabel(/^Password/).fill(TEST_PASSWORD);
  await dialog.getByRole('button', { name: 'Create my account', exact: true }).click();
  await expect(dialog.getByRole('heading', { name: 'Check your inbox' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Sign in to create invitations' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Choose a design' })).toHaveCount(0);
  await expectNoLocalDocuments(page);
});

test('dashboard shows only its owner and draft editor links resume cloud documents', async ({ page, request }) => {
  const account = await createAccount(request);
  const other = await createAccount(request, 'other');
  const own = await seedInvitation(request, account.id, 'My private cloud draft');
  await seedInvitation(request, other.id, 'Another account public event', true);
  await seedInvitation(request, other.id, 'Another account private event');
  await signInThroughUI(page, account.email);
  const card = page.locator('li').filter({ has: page.getByRole('heading', { name: 'My private cloud draft' }) });
  await expect(card).toBeVisible();
  await expect(page.getByRole('heading', { name: /Another account/ })).toHaveCount(0);
  await expect(card.getByRole('link', { name: 'Edit', exact: true })).toHaveAttribute('href', `/create?draft=${own.id}`);
  await card.getByRole('link', { name: 'Edit', exact: true }).click();
  const main = page.locator('main');
  await main.getByRole('button', { name: 'Continue', exact: true }).click();
  await main.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(main.locator('#host1')).toHaveValue('My private cloud draft');
  await expectNoLocalDocuments(page);
});

test('private draft is unavailable on public URL even for its owner', async ({ page, browser, request }) => {
  const account = await createAccount(request);
  const draft = await seedInvitation(request, account.id, 'Unpublished private names');
  await signInThroughUI(page, account.email);
  await page.goto(`/i/${draft.slug}`);
  await expect(page.getByRole('heading', { name: /find.*that invitation/ })).toBeVisible();
  const guestContext = await browser.newContext();
  try {
    const guest = await guestContext.newPage();
    await guest.goto(`/i/${draft.slug}`);
    await expect(guest.getByRole('heading', { name: /find.*that invitation/ })).toBeVisible();
    await expect(guest.getByText('Unpublished private names', { exact: true })).toHaveCount(0);
  } finally { await guestContext.close(); }
});

test('cloud autosave resumes in a different browser session without local documents', async ({ page, browser, request }) => {
  const account = await login(page, request);
  await page.goto('/create');
  const main = page.locator('main');
  await main.getByRole('button', { name: 'Continue', exact: true }).click();
  await main.getByRole('button', { name: 'Continue', exact: true }).click();
  await main.locator('#host1').fill('Cross browser saved host');
  await expect(page.getByText('Saved', { exact: true })).toBeAttached();
  await expect(page).toHaveURL(/\/create\?draft=[0-9a-f-]{36}/);
  const draftUrl = page.url();
  await expectNoLocalDocuments(page);
  const secondContext = await browser.newContext();
  try {
    const second = await secondContext.newPage();
    await signInThroughUI(second, account.email);
    await second.goto(draftUrl);
    await second.locator('main').getByRole('button', { name: 'Continue', exact: true }).click();
    await second.locator('main').getByRole('button', { name: 'Continue', exact: true }).click();
    await expect(second.locator('#host1')).toHaveValue('Cross browser saved host');
    await expectNoLocalDocuments(second);
  } finally { await secondContext.close(); }
});

test('failed cloud save reports failure and does not fall back to local storage', async ({ page, request }) => {
  await login(page, request);
  await page.goto('/create');
  await expect(page).toHaveURL(/\/create\?draft=[0-9a-f-]{36}/);
  await page.route(`${mockOrigin()}/rest/v1/invitations*`, async route => {
    if (route.request().method() === 'POST') await route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ message: 'Test backend unavailable' }), headers: { 'Access-Control-Allow-Origin': '*' } });
    else await route.continue();
  });
  const main = page.locator('main');
  await main.getByRole('button', { name: 'Continue', exact: true }).click();
  await main.getByRole('button', { name: 'Continue', exact: true }).click();
  await main.locator('#host1').fill('Unsaved cloud edit');
  await expect(main.getByRole('alert')).toContainText(/Could not save|unavailable/);
  await expect(page.getByText('Not saved', { exact: true })).toBeAttached();
  await expectNoLocalDocuments(page);
});

test('publishing with a slow cloud response stays live after leaving the editor', async ({ page, browser, request }) => {
  const account = await createAccount(request);
  const draft = await seedInvitation(request, account.id, 'Slow publishing host');
  await signInThroughUI(page, account.email);
  await page.goto(`/create?draft=${draft.id}`);
  const main = page.locator('main');
  for (let step = 1; step < 14; step++) {
    await main.getByRole('button', { name: step === 13 ? 'Publish' : 'Continue', exact: true }).click();
  }
  const publishedSlug = `slow-${randomUUID()}`;
  await main.getByLabel('Custom link').fill(publishedSlug);
  await page.route(`${mockOrigin()}/rest/v1/invitations*`, async route => {
    if (route.request().method() === 'POST' && route.request().postDataJSON().published) {
      // A real network delay long enough for a draft debounce to fire while
      // publishing is in flight. A stale save must not overwrite publication.
      await new Promise(resolve => setTimeout(resolve, 1100));
    }
    await route.continue();
  });
  await main.getByRole('button', { name: 'Publish invitation', exact: true }).click();
  await expect(main.getByRole('button', { name: 'Update the live link', exact: true })).toBeVisible();
  await page.goto('/my-invitations');
  const card = page.locator('li').filter({ has: page.getByRole('heading', { name: 'Slow publishing host' }) });
  await expect(card.getByText('Live', { exact: true })).toBeVisible();
  const guestContext = await browser.newContext();
  try {
    const guest = await guestContext.newPage();
    await guest.goto(`/i/${publishedSlug}`);
    await expect(guest.getByRole('button', { name: 'Open Invitation', exact: true })).toBeVisible();
  } finally { await guestContext.close(); }
});

test('cloud photo stays available to guests and a failed replacement preserves it', async ({ page, browser, request }) => {
  await login(page, request);
  await page.goto('/create');
  const main = page.locator('main');
  await main.getByRole('button', { name: 'Continue', exact: true }).click();
  const image = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64');
  await main.locator('input[type="file"]').setInputFiles({ name: 'cloud-cover.png', mimeType: 'image/png', buffer: image });
  const cover = main.getByRole('img', { name: 'Cover', exact: true });
  await expect(cover).toHaveAttribute('src', new RegExp(`${mockOrigin()}/storage/v1/object/public/galleries/`));
  const uploadedUrl = await cover.getAttribute('src');
  expect(uploadedUrl).toBeTruthy();
  await expect(page.getByText('Saved', { exact: true })).toBeAttached();
  await page.route(`${mockOrigin()}/storage/v1/object/galleries/**`, async route => {
    if (route.request().method() === 'POST') await route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ message: 'Test upload failed' }) });
    else await route.continue();
  });
  await main.locator('input[type="file"]').setInputFiles({ name: 'replacement.png', mimeType: 'image/png', buffer: image });
  await expect(page.getByText('Could not upload photo', { exact: true })).toBeVisible();
  await expect(cover).toHaveAttribute('src', uploadedUrl!);
  await page.reload();
  await main.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(main.getByRole('img', { name: 'Cover', exact: true })).toHaveAttribute('src', uploadedUrl!);
  await expectNoLocalDocuments(page);
  const guestContext = await browser.newContext();
  try {
    const response = await guestContext.request.get(uploadedUrl!);
    expect(response.ok()).toBeTruthy();
    expect(response.headers()['content-type']).toBe('image/png');
    expect(await response.body()).toEqual(image);
  } finally { await guestContext.close(); }
});
