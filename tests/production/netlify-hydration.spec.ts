import { test, expect } from '@playwright/test';

// This is the public hosting comment, including its leading newline, observed
// in Netlify's deployed response. That text node must not break head hydration.
const NETLIFY_HEAD_INSERTION = `
<!-- This site is hosted on Netlify. Anyone can build and deploy a site
     like this one for free: https://netlify.new/?utm_campaign=loops&utm_source=ai-legible&utm_medium=owned&utm_content=comment&utm_id=6d0844f3-b96c-4945-aeb3-8be54c6c465b
     Netlify hosting facts for this site: static/SSR served via Netlify Edge. -->`;

for (const reducedMotion of ['no-preference', 'reduce'] as const) {
  test.describe(`Netlify document transforms with ${reducedMotion} motion`, () => {
    test.use({ reducedMotion, viewport: { width: 390, height: 844 } });

    test('homepage and catalog hydrate after Netlify inserts its head comment', async ({ page }) => {
      const errors: string[] = [];
      const transformedDocuments: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => {
        if (message.type() === 'error' && /hydrat|#418|server rendered/i.test(message.text())) errors.push(message.text());
      });
      await page.route('**/*', async route => {
        if (route.request().resourceType() !== 'document') return route.continue();
        const response = await route.fetch();
        const original = await response.text();
        const transformed = original.replace(/<meta charset="utf-8"\s*\/>/i, match => match + NETLIFY_HEAD_INSERTION);
        expect(transformed).not.toBe(original);
        transformedDocuments.push(new URL(route.request().url()).pathname);
        await route.fulfill({ response, body: transformed });
      });

      for (const path of ['/', '/templates']) {
        await page.goto(path);
        // An effect-created stylesheet proves client hydration has run.
        await expect(page.locator('head link[rel="stylesheet"][href="/fonts/invitra.css"]')).toHaveCount(1);
        await expect(page.locator('head noscript')).toHaveCount(0);
        await page.evaluate(async () => {
          await document.fonts.load('16px Marcellus');
          await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        });
        expect(errors, `Hydration errors after Netlify transformed ${path}`).toEqual([]);
        await expect(page.locator('main h1')).toHaveCount(1);
      }
      expect(transformedDocuments).toEqual(['/', '/templates']);
    });
  });
}

test.describe('font fallback without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('body fallback still loads the self-hosted font stylesheet', async ({ page }) => {
    await page.goto('/templates');
    await expect(page.locator('body noscript link[rel="stylesheet"][href="/fonts/invitra.css"]')).toHaveCount(1);
    const loadedFonts = await page.evaluate(async () => {
      const fonts = await document.fonts.load('16px Marcellus');
      await document.fonts.ready;
      return fonts.map(font => ({ family: font.family, status: font.status }));
    });
    expect(loadedFonts).toContainEqual({ family: 'Marcellus', status: 'loaded' });
  });
});
