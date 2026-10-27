import { test, expect } from '@playwright/test';

for (const reducedMotion of ['reduce', 'no-preference'] as const) {
  test.describe(`hydration with motion preference ${reducedMotion}`, () => {
    test.use({ reducedMotion, viewport: { width: 412, height: 915 } });

    test('marketing and invitation pages hydrate with local fonts', async ({ page }) => {
      const errors: string[] = [];
      const externalFonts: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => {
        if (message.type() === 'error' && /hydrat|#418|server rendered/i.test(message.text())) {
          errors.push(message.text());
        }
      });
      page.on('request', request => {
        if (/fonts\.(googleapis|gstatic)\.com/.test(request.url())) externalFonts.push(request.url());
      });

      for (const path of ['/', '/templates', '/demo', '/about']) {
        await page.goto(path);
        await expect(page.locator('head link[rel="stylesheet"][href="/fonts/invitra.css"]')).toHaveCount(1);
        await page.evaluate(async () => {
          await document.fonts.load('16px Marcellus');
          await document.fonts.ready;
          await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        });
        expect(errors, `JavaScript errors on ${path}`).toEqual([]);
        expect(externalFonts).toEqual([]);
        expect(await page.evaluate(() => document.fonts.check('16px Marcellus'))).toBe(true);
        await expect(page.locator('h1')).toHaveCount(1);
      }

      await page.emulateMedia({ reducedMotion: reducedMotion === 'reduce' ? 'no-preference' : 'reduce' });
      expect(errors).toEqual([]);
    });
  });
}
