import { test, expect } from '../support/fixtures';

test.beforeEach(async ({ account }) => { expect(account.id).toBeTruthy(); });

test('fourteen steps, autosave, publish, RSVP, guest book and dashboard', async ({ page, browser }, testInfo) => {
  test.setTimeout(180_000);
  const slug = `e2e-${testInfo.project.name}-${Date.now()}`;
  await page.goto('/create');
  const main = page.locator('main');
  for (let step = 1; step <= 14; step++) {
    await expect(main.getByText(new RegExp(`^Step ${step} of 14`))).toBeVisible();
    if (step === 3) {
      await main.locator('#host1').fill('Playwright Host');
      await main.locator('#host2').fill('Test Partner');
    }
    if (step === 4) await main.getByLabel('Date', { exact: true }).fill('2027-12-20');
    if (step === 5) await main.getByLabel('Starts', { exact: true }).fill('18:30');
    if (step === 6) {
      await main.getByLabel('Venue name').fill('Test Garden');
      await main.getByLabel('Full address').fill('123 Test Road, Lahore');
    }
    if (step < 14) await main.getByRole('button', { name: step === 13 ? 'Publish' : 'Continue', exact: true }).click();
  }
  await main.getByLabel('Custom link').fill(slug);
  await main.getByRole('button', { name: 'Publish invitation', exact: true }).click();
  await expect(main.getByRole('button', { name: 'Update the live link' })).toBeVisible();
  await expect(page.getByText('Saved', { exact: true })).toBeAttached();
  await page.reload();
  await main.getByRole('button', { name: 'Continue', exact: true }).click();
  await main.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(main.locator('#host1')).toHaveValue('Playwright Host');
  await expect(main.locator('#host2')).toHaveValue('Test Partner');
  const guestContext = await browser.newContext();
  const guest = await guestContext.newPage();
  await guest.goto(`/i/${slug}`);
  await guest.getByRole('button', { name: 'Open Invitation', exact: true }).click();
  await expect(guest.locator('#venue')).toContainText('Test Garden');
  const rsvp = guest.locator('#rsvp');
  await rsvp.getByRole('button', { name: 'Send RSVP', exact: true }).click();
  await expect(rsvp.getByText('Please tell us your name')).toBeVisible();
  await rsvp.locator('#rsvp-name').fill('Test Guest');
  await rsvp.locator('#rsvp-email').fill('guest@example.com');
  await rsvp.getByRole('button', { name: 'Send RSVP', exact: true }).click();
  await expect(rsvp.getByText(/your reply has been recorded/)).toBeVisible();
  const book = guest.locator('#guestbook');
  await expect(book.getByRole('button', { name: 'Leave a note', exact: true })).toBeDisabled();
  await book.locator('#gb-name').fill('Test Guest');
  await book.locator('#gb-body').fill('Wishing you a wonderful celebration!');
  await book.getByRole('button', { name: 'Leave a note', exact: true }).click();
  await expect(book.locator('ul').getByText('Wishing you a wonderful celebration!', { exact: true })).toBeVisible();
  await guestContext.close();
  await page.goto('/my-invitations');
  const card = page.locator('li').filter({ has: page.getByRole('heading', { name: /Playwright Host/ }) });
  await expect(card.getByText('Live', { exact: true })).toBeVisible();
  await expect(card.getByText(/1 attending.*1 replies/)).toBeVisible();
  await expect(card.getByText('1 notes', { exact: true })).toBeVisible();
  await card.getByRole('link', { name: 'Manage', exact: true }).click();
  await expect(page).toHaveURL(/\/my-invitations\/[0-9a-f-]{36}$/, { timeout: 45_000 });
  await expect(page.getByText('guest@example.com', { exact: true })).toBeVisible();
  await expect(page.getByText('Wishing you a wonderful celebration!', { exact: true })).toBeVisible();
  await page.goto('/my-invitations');
  for (const format of ['PNG', 'PDF']) {
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: format, exact: true }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(new RegExp(`\\.${format.toLowerCase()}$`));
    expect(await download.failure()).toBeNull();
  }
});

test('occasion and language changes preserve custom names', async ({ page }) => {
  await page.goto('/create?occasion=birthday');
  const main = page.locator('main');
  await expect(main.getByLabel('Occasion', { exact: true })).toHaveValue('birthday');
  await main.locator('#language').selectOption('ur');
  await main.getByRole('button', { name: 'Continue', exact: true }).click();
  await main.getByRole('button', { name: 'Continue', exact: true }).click();
  await main.locator('#host1').fill('Custom Birthday Name');
  await main.getByRole('button', { name: 'Back', exact: true }).click();
  await main.getByRole('button', { name: 'Back', exact: true }).click();
  await main.getByLabel('Occasion', { exact: true }).selectOption('wedding');
  await expect(main.locator('#language')).toHaveValue('ur');
  await main.getByRole('button', { name: 'Continue', exact: true }).click();
  await main.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(main.locator('#host1')).toHaveValue('Custom Birthday Name');
});
