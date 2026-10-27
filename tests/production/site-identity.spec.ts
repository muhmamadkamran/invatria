import { test, expect } from '@playwright/test';

test('homepage associates the Invatria search spelling with the Invitra brand', async ({ request, page }) => {
  const response = await request.get('/');
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toMatch(/<title>Invitra[^<]*Invitation Card Maker/);
  expect(html).toContain('also known as Invatria');
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .flatMap(match => [JSON.parse(match[1])].flat());
  const websites = schemas.filter(schema => schema['@type'] === 'WebSite');
  expect(websites).toHaveLength(1);
  expect(websites[0].name).toBe('Invitra');
  expect(websites[0].alternateName).toContain('Invatria');
  expect(websites[0].url).toMatch(/^https?:\/\/.+\/$/);
  expect(websites[0].alternateName).toContain(new URL(websites[0].url).hostname);
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)!;
  expect(new URL(websites[0].url).origin).toBe(new URL(canonical[1]).origin);
  const sitemap = await (await request.get('/sitemap.xml')).text();
  for (const match of sitemap.matchAll(/<loc>(.*?)<\/loc>/g)) {
    expect(new URL(match[1]).origin).toBe(new URL(canonical[1]).origin);
  }
  const organization = schemas.find(schema => schema['@type'] === 'Organization');
  expect(organization.name).toBe('Invitra');
  expect(organization.alternateName).toBe('Invatria');
  expect(websites[0].publisher['@id']).toBe(organization['@id']);

  await page.goto('/');
  await expect(page.locator('footer')).toContainText('also known as Invatria');
  await expect(page.locator('header').first()).toContainText('Invitra');
  const about = await request.get('/about');
  expect(await about.text()).toContain('also known as Invatria');
});
