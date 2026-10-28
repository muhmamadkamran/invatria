import { test, expect } from '@playwright/test';

test('search crawlers can discover public pages with matching invitation exclusions', async ({ request }) => {
  const response = await request.get('/robots.txt');
  expect(response.status()).toBe(200);
  const robots = await response.text();
  const groups = robots.trim().split(/\n\s*\n/);
  for (const bot of ['Googlebot', 'bingbot', 'OAI-SearchBot', 'Claude-SearchBot', 'PerplexityBot']) {
    const group = groups.find(block => block.split('\n').some(line => line.toLowerCase() === `user-agent: ${bot.toLowerCase()}`))
      ?? groups.find(block => block.includes('User-Agent: *'))!;
    expect(group).toContain('Allow: /');
    for (const path of ['/i/', '/create', '/my-invitations', '/auth/']) {
      expect(group, `${bot} privacy exclusion`).toContain(`Disallow: ${path}`);
    }
    const about = await request.get('/about', { headers: { 'User-Agent': bot } });
    expect(about.status()).toBe(200);
    expect(await about.text()).toContain('What is Invitra?');
  }
});

test('optional plain-text summary lists public facts and reachable canonical pages', async ({ request }) => {
  const response = await request.get('/llms.txt');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('text/plain');
  const text = await response.text();
  expect(text).toContain('# Invitra');
  expect(text).toContain('A free account is required to save');
  expect(text).toContain('Guests can open a published invitation and RSVP without');
  expect(text).not.toMatch(/https?:\/\/[^\s)]*\/(?:i|auth|my-invitations|create)(?:\/|[?\s)])/);
  const links = [...text.matchAll(/\]\((https?:\/\/[^)]+)\)/g)].map(match => new URL(match[1]));
  expect(links.length).toBeGreaterThan(5);
  for (const link of links) expect((await request.get(link.pathname)).status()).toBe(200);
});

test('product facts are visible without JavaScript and match application schema', async ({ browser, request }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  const origin = test.info().project.use.baseURL!;
  await page.goto(`${origin}/about`);
  await expect(page.getByRole('heading', { name: 'What is Invitra?', exact: true })).toBeVisible();
  await expect(page.locator('#product-facts')).toContainText('Free to use.');
  await expect(page.locator('#product-facts')).toContainText('A free account is required');
  await expect(page.locator('#product-facts')).toContainText('without creating an account');
  const html = await (await request.get('/about')).text();
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .flatMap(match => [JSON.parse(match[1])].flat());
  const application = schemas.find(schema => schema['@type'] === 'WebApplication');
  expect(application.name).toBe('Invitra');
  expect(application.isAccessibleForFree).toBe(true);
  expect(application.offers.price).toBe('0');
  expect(application.inLanguage).toContain('en');
  expect(application.publisher['@id']).toContain('/#organization');
  await context.close();
});
