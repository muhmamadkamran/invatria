import { test, expect } from '@playwright/test';
import { INVITATION_GUIDES } from '../../lib/invitation-guides';

test('occasion pages are crawlable, internally linked and included in the sitemap', async ({ request }) => {
  const hub = await request.get('/invitations');
  expect(hub.status()).toBe(200);
  const hubHtml = await hub.text();
  const sitemap = await (await request.get('/sitemap.xml')).text();
  for (const guide of INVITATION_GUIDES) {
    const path = `/invitations/${guide.slug}`;
    expect(hubHtml).toContain(`href="${path}"`);
    expect(sitemap).toContain(`${path}</loc>`);
    const response = await request.get(path);
    expect(response.status()).toBe(200);
    const html = await response.text();
    expect(html.match(/<h1(?:\s|>)/g)).toHaveLength(1);
    expect(html).toContain(guide.title);
    expect(html).toMatch(new RegExp(`<link rel="canonical" href="[^"]+${path}"`));
    expect(html).not.toMatch(/name="robots" content="[^"]*noindex/);
    expect(html).toContain('What to include');
    expect(html).toContain('Copy sample wording');
    expect(html).toContain(`occasion=${guide.category}`);
    const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1]));
    expect(schemas.some(schema => schema['@type'] === 'BreadcrumbList')).toBe(true);
    const faq = schemas.find(schema => schema['@type'] === 'FAQPage');
    expect(faq.mainEntity).toHaveLength(guide.faqs.length);
    for (const item of faq.mainEntity) expect(html).toContain(item.name);
  }
  expect((await request.get('/invitations/not-an-occasion')).status()).toBe(404);
});

test('visitors can copy wording and choose a birthday template', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/invitations/birthday');
  await expect(page.locator('head link[rel="stylesheet"][href="/fonts/invitra.css"]')).toHaveCount(1);
  await page.getByRole('button', { name: 'Copy sample wording' }).click();
  await expect(page.getByRole('status')).toContainText('Copied.');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain("birthday!");
  const createLink = page.getByRole('link', { name: 'Create your invitation', exact: true });
  const url = new URL((await createLink.getAttribute('href'))!, 'http://localhost');
  expect(url.searchParams.get('occasion')).toBe('birthday');
  expect(url.searchParams.get('template')).toBeTruthy();
  await expect(page.getByRole('link', { name: 'Preview design' }).first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});
