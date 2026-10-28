import { test, expect } from '@playwright/test';
import { TEMPLATES } from '../../lib/templates';
import { CATEGORIES } from '../../lib/categories';
import { login } from '../support/fixtures';

test('landing page, FAQ and theme preference', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const faq = page.locator('details').filter({ has: page.locator('summary', { hasText: 'Do I need an account?' }) });
  await faq.locator('summary').click();
  await expect(faq).toHaveAttribute('open', '');
  await faq.locator('summary').click();
  await expect(faq).not.toHaveAttribute('open');
  const mobileMenu = (page.viewportSize()?.width ?? 1440) < 640;
  if (mobileMenu) await page.getByRole('button', { name: 'Open menu', exact: true }).click();
  await page.getByRole('button', { name: 'Switch to dark mode' }).filter({ visible: true }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/dark/);
  if (mobileMenu) await page.getByRole('button', { name: 'Open menu', exact: true }).click();
  await page.getByRole('button', { name: 'Switch to light mode' }).filter({ visible: true }).click();
  await expect(page.locator('html')).not.toHaveClass(/dark/);
});

test('all occasion filters show the matching templates', async ({ page }) => {
  await page.goto('/templates');
  // Auth controls appear after client hydration; wait before the first filter
  // click so a cold Next dev build cannot swallow it during hydration.
  await expect(page.getByRole('button', { name: 'Sign in', exact: true, includeHidden: true }).first()).toBeAttached();
  for (const category of CATEGORIES) {
    await page.getByRole('button', { name: category.label, exact: true }).click();
    await expect(page.getByRole('button', { name: category.label, exact: true })).toHaveAttribute('aria-pressed', 'true');
    const expected = TEMPLATES.filter(t => t.bestFor.includes(category.id));
    await expect(page.getByRole('link', { name: 'Preview', exact: true })).toHaveCount(expected.length);
    for (const template of expected) {
      await expect(page.getByRole('link', { name: 'Preview', exact: true }).and(page.locator(`a[href="/templates/${template.id}"]`))).toBeVisible();
    }
  }
  await page.getByRole('button', { name: 'All occasions', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Preview', exact: true })).toHaveCount(TEMPLATES.length);
});

for (const template of TEMPLATES) {
  test(`${template.name} preview opens and selects the design`, async ({ page, request }) => {
    await login(page, request);
    await page.goto(`/templates/${template.id}`);
    await expect(page.getByRole('heading', { name: `${template.name} invitation template`, exact: true })).toBeVisible();
    await page.locator('#venue').scrollIntoViewIfNeeded();
    await expect(page.locator('#venue')).toBeVisible();
    await page.getByRole('link', { name: 'Use this', exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/create\\?template=${template.id}`));
    await expect(page.getByRole('button', { name: new RegExp(template.name) })).toHaveAttribute('aria-pressed', 'true');
  });
}

test('empty dashboard and missing invitation have recovery links', async ({ page, request }) => {
  await login(page, request);
  await page.goto('/my-invitations');
  await expect(page.getByText('Nothing here yet', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Create your first' }).click();
  await expect(page.getByRole('heading', { name: 'Choose a design' })).toBeVisible();
  await page.goto('/i/nonexistent-playwright-invitation');
  await expect(page.getByRole('heading', { name: /find.*that invitation/ })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Create an invitation', exact: true })).toHaveAttribute('href', '/create');
});
