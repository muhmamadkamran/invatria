import { test, expect } from '@playwright/test';

function metaContent(html: string, key: string, attribute: 'name' | 'property' = 'property') {
  const tags = [...html.matchAll(/<meta\b[^>]*>/g)].map(match => match[0]);
  const matches = tags.filter(tag => tag.includes(`${attribute}="${key}"`));
  expect(matches, `one ${key} meta tag`).toHaveLength(1);
  return matches[0].match(/\bcontent="([^"]*)"/)![1];
}

test('public pages share local preview images while retaining their own social URL and subject', async ({ request }) => {
  const pages = [
    { path: '/', title: 'Invitation Card Maker' },
    { path: '/templates', title: 'Invitation Card Templates' },
    { path: '/templates/royal-gold', title: 'Royal Gold' },
    { path: '/invitations/wedding', title: 'wedding invitations' },
    { path: '/about', title: 'About Invitra' },
    { path: '/demo', title: 'finished invitation' },
    { path: '/tools/whatsapp-invitation-message', title: 'WhatsApp Invitation Message' },
  ];
  for (const { path, title } of pages) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
    const html = await response.text();
    const canonical = new URL(html.match(/<link rel="canonical" href="([^"]+)"/)![1]);
    const socialUrl = new URL(metaContent(html, 'og:url'));
    expect(socialUrl.pathname, path).toBe(path);
    expect(socialUrl.href, path).toBe(canonical.href);
    expect(metaContent(html, 'og:title'), path).toContain(title);
    expect(metaContent(html, 'twitter:title', 'name'), path).toContain(title);
    expect(metaContent(html, 'og:description').length, path).toBeGreaterThan(40);
    expect(metaContent(html, 'twitter:description', 'name').length, path).toBeGreaterThan(40);
    const image = new URL(metaContent(html, 'og:image'));
    expect(image.origin, path).toBe(canonical.origin);
    expect(image.pathname, path).toBe('/images/invitra-share.png');
    expect(metaContent(html, 'og:image:width'), path).toBe('1200');
    expect(metaContent(html, 'og:image:height'), path).toBe('630');
    expect(metaContent(html, 'og:image:alt'), path).toContain('Invitra');
    expect(metaContent(html, 'twitter:card', 'name'), path).toBe('summary_large_image');
    expect(metaContent(html, 'twitter:image', 'name'), path).toBe(image.href);
    expect(metaContent(html, 'twitter:image:alt', 'name'), path).toContain('Invitra');
    expect(html).not.toContain('Unlimited and free, forever');
  }

  const imageResponse = await request.get('/images/invitra-share.png');
  expect(imageResponse.status()).toBe(200);
  expect(imageResponse.headers()['content-type']).toContain('image/png');
  const bytes = await imageResponse.body();
  expect(bytes.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
  expect(bytes.readUInt32BE(16)).toBe(1200);
  expect(bytes.readUInt32BE(20)).toBe(630);
});
