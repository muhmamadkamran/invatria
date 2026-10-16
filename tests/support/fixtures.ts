import { randomUUID } from 'node:crypto';
import { test as base, expect, type Page, type APIRequestContext } from '@playwright/test';

export function mockOrigin() {
  const origin = process.env.E2E_SUPABASE_URL;
  if (!origin || new URL(origin).hostname !== '127.0.0.1') throw new Error('Isolated test Supabase was not started. Run global setup first.');
  return origin;
}

export const TEST_PASSWORD = 'Playwright-test-only-8';

export async function createAccount(request: APIRequestContext, prefix = 'owner') {
  const email = `${prefix}-${randomUUID()}@example.test`;
  const result = await request.post(`${mockOrigin()}/__test/users`, { data: { email, password: TEST_PASSWORD } });
  expect(result.ok()).toBeTruthy();
  return await result.json() as { id: string; email: string };
}

export async function signInThroughUI(page: Page, email: string) {
  await page.goto('/my-invitations');
  await page.locator('main').getByRole('button', { name: 'Sign in', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Welcome back' });
  await expect(dialog.getByLabel('Email', { exact: true })).toBeFocused();
  await dialog.getByLabel('Email', { exact: true }).fill(email);
  await dialog.getByLabel('Password', { exact: true }).fill(TEST_PASSWORD);
  await dialog.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole('heading', { name: /^My invitations$/i })).toBeVisible();
}

export async function login(page: Page, request: APIRequestContext) {
  const account = await createAccount(request);
  await signInThroughUI(page, account.email);
  return account;
}

export const test = base.extend<{ account: { id: string; email: string } }>({
  account: async ({ page, request }, provide) => {
    const account = await login(page, request);
    await provide(account);
  },
});
export { expect };
