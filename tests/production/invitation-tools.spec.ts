import { test, expect, type Locator } from '@playwright/test';
import { TEMPLATES } from '../../lib/templates';
import { demoInvitation } from '../../lib/defaults';

const toolPath = '/tools/whatsapp-invitation-message';

async function expectPainted(locator: Locator) {
  await expect(locator).toBeVisible();
  // Visibility alone allows opacity:0, which hid important content in earlier SSR builds.
  expect(await locator.evaluate(element => {
    for (let ancestor: Element | null = element; ancestor; ancestor = ancestor.parentElement) {
      const style = getComputedStyle(ancestor);
      if (Number(style.opacity) === 0 || style.visibility !== 'visible' || style.display === 'none') return false;
    }
    return true;
  })).toBe(true);
}

test.describe('invitation landing content without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('WhatsApp tool explains its purpose, account requirements and sending workflow before hydration', async ({ page, request }) => {
    await page.goto(toolPath);
    await expect(page.locator('main h1')).toHaveCount(1);
    await expectPainted(page.getByRole('heading', { level: 1, name: 'Write an invitation message for WhatsApp' }));
    await expectPainted(page.getByText('No account is required to prepare wording here.', { exact: false }));
    await expectPainted(page.getByRole('heading', { name: 'How to send your invitation link' }));
    await expect(page.locator('main article ol li')).toHaveCount(4);
    await expect(page.locator('main')).toContainText('does not track WhatsApp delivery or read receipts');
    await expect(page.locator('main')).toContainText('free host account is required');
    const sitemap = await (await request.get('/sitemap.xml')).text();
    expect(sitemap).toContain(`${toolPath}</loc>`);
  });

  test('every design has one descriptive H1 and readable sample names at H2 without an envelope gate', async ({ page }) => {
    for (const template of TEMPLATES) {
      await page.goto(`/templates/${template.id}`);
      const heading = page.getByRole('heading', { level: 1 });
      await expect(heading).toHaveCount(1);
      await expect(heading).toHaveText(`${template.name} invitation template`);
      await expectPainted(heading);
      await expect(page.locator('main')).toContainText(template.description);
      await expect(page.locator('main')).toContainText('sample event preview');
      const sample = page.getByRole('region', { name: `${template.name} sample invitation` });
      const nameHeading = sample.locator('h2').first();
      await expect(nameHeading).toContainText(demoInvitation(template.id).hostPrimary);
      await expectPainted(nameHeading);
      await expect(page.getByRole('button', { name: 'Open Invitation', exact: true })).toHaveCount(0);
      await expect(page.getByRole('link', { name: `Use ${template.name}`, exact: true }).last()).toHaveAttribute('href', `/create?template=${template.id}`);
    }
  });
});

test('WhatsApp message includes event details, venue time and instructions without sending externally', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto(toolPath);
  await page.getByRole('combobox', { name: 'Occasion', exact: true }).selectOption('birthday');
  await page.getByLabel('Name or names', { exact: true }).fill('Ayesha');
  await page.getByLabel('Event date', { exact: true }).fill('2027-12-12');
  await page.getByLabel('Event time', { exact: true }).fill('18:30');
  await page.getByLabel('Venue and address', { exact: true }).fill('Rose Garden, 12 Park Road');
  await page.getByLabel('Reply by', { exact: true }).fill('2027-12-01');
  await page.getByLabel('Guest instructions (optional)', { exact: true }).fill('Please arrive 15 minutes early. Parents are welcome.');
  const invitationUrl = 'https://example.test/i/ayesha?source=whatsapp&guest=family';
  await page.getByLabel('Published invitation link (optional)', { exact: true }).fill(invitationUrl);

  const preview = page.getByLabel('Prepared invitation message', { exact: true });
  await expect(preview).toHaveValue(/Ayesha's birthday!/);
  await expect(preview).toHaveValue(/December 12, 2027/);
  await expect(preview).toHaveValue(/Time: 6:30 PM/);
  await expect(preview).toHaveValue(/Rose Garden, 12 Park Road/);
  await expect(preview).toHaveValue(/RSVP by December 1, 2027/);
  await expect(preview).toHaveValue(/Please arrive 15 minutes early\. Parents are welcome\./);
  const message = await preview.inputValue();
  expect(message).toContain(invitationUrl);
  expect(message).not.toMatch(/\[[^\]]+\]/);

  // Inspect the destination only. No recipient is chosen and nothing is sent to WhatsApp.
  const shareLink = page.getByText('Open WhatsApp with this message', { exact: true });
  const destination = new URL((await shareLink.getAttribute('href'))!);
  expect(destination.origin).toBe('https://wa.me');
  expect(destination.searchParams.get('text')).toBe(message);
  await expect(page.getByRole('link', { name: 'Create an Invitra invitation', exact: true })).toHaveAttribute('href', '/create?occasion=birthday');
  await page.getByRole('button', { name: 'Copy invitation message', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Message copied.');
  // Windows clipboard normalizes line endings; the invitation wording stays identical.
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied.replace(/\r\n/g, '\n')).toBe(message);

  await page.getByRole('combobox', { name: 'Occasion', exact: true }).selectOption('nikah');
  await expect(preview).toHaveValue(/nikah of Ayesha/);
  const updatedDestination = new URL((await shareLink.getAttribute('href'))!);
  expect(updatedDestination.searchParams.get('text')).toBe(await preview.inputValue());
});

test('unsafe invitation URLs cannot be copied or placed in the WhatsApp destination', async ({ page }) => {
  await page.goto(toolPath);
  const linkInput = page.getByLabel('Published invitation link (optional)', { exact: true });
  const shareLink = page.getByText('Open WhatsApp with this message', { exact: true });
  const copyButton = page.getByRole('button', { name: 'Copy invitation message', exact: true });
  const preview = page.getByLabel('Prepared invitation message', { exact: true });
  for (const unsafeUrl of ['javascript:alert(1)', 'http://example.test/invite', 'https://user:password@example.test/invite', 'not a website']) {
    await linkInput.fill(unsafeUrl);
    await expect(linkInput).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#invitation-link-help')).toContainText('Enter a complete https:// invitation link');
    await expect(copyButton).toBeDisabled();
    await expect(shareLink).toHaveAttribute('aria-disabled', 'true');
    expect(await shareLink.getAttribute('href')).toBeNull();
    expect(await preview.inputValue()).not.toContain(unsafeUrl);
  }
  await linkInput.fill('https://example.test/invite');
  await expect(copyButton).toBeEnabled();
  await expect(linkInput).toHaveAttribute('aria-invalid', 'false');
  await expect(shareLink).toHaveAttribute('href', /^https:\/\/wa\.me\//);
  await linkInput.fill('');
  await expect(copyButton).toBeEnabled();
  await expect(preview).toHaveValue(/\[Add your invitation link here\]/);
});
