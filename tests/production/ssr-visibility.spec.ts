import { test, expect, type Locator } from '@playwright/test';

// Playwright's visibility matcher permits opacity:0. Check the text and its
// ancestors as well so these tests catch content hidden by entrance effects.
async function expectReadable(locator: Locator) {
  await expect(locator).toBeVisible();
  const hiddenText = await locator.evaluate(element => {
    const targets = new Set<Element>([element]);
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      if (walker.currentNode.textContent?.trim() && walker.currentNode.parentElement) {
        targets.add(walker.currentNode.parentElement);
      }
    }
    const failures: string[] = [];
    for (const target of targets) {
      for (let ancestor: Element | null = target; ancestor; ancestor = ancestor.parentElement) {
        const style = getComputedStyle(ancestor);
        if (Number(style.opacity) === 0 || style.visibility !== 'visible' || style.display === 'none' || /blur\((?!0(?:px)?\))/.test(style.filter)) {
          failures.push(`${ancestor.tagName}: opacity=${style.opacity}, visibility=${style.visibility}, filter=${style.filter}`);
          break;
        }
      }
    }
    return [...new Set(failures)];
  });
  expect(hiddenText, 'Essential content should be painted before hydration').toEqual([]);
}

test.describe('public content without browser JavaScript', () => {
  test.use({ javaScriptEnabled: false, viewport: { width: 1280, height: 960 } });

  test('catalog headings, all six designs and their actions are readable', async ({ page }) => {
    await page.goto('/templates');
    await expectReadable(page.locator('main h2').first());
    const cards = page.locator('main article');
    await expect(cards).toHaveCount(6);
    for (const card of await cards.all()) {
      await expectReadable(card.getByRole('heading', { level: 3 }));
      await expectReadable(card.locator('[class*="aspect-[5/7]"]'));
      await expectReadable(card.getByRole('link', { name: 'Use this design', exact: true }));
      await expectReadable(card.getByRole('link', { name: 'Preview', exact: true }));
    }
  });

  test('homepage copy, creation link, headings and preview shelf are readable', async ({ page }) => {
    await page.goto('/');
    const hero = page.locator('section[aria-labelledby="hero-heading"]');
    await expectReadable(hero.getByRole('heading', { level: 1 }));
    await expectReadable(hero.getByText(/Make a free digital invitation card for your wedding/));
    await expectReadable(hero.getByRole('link', { name: 'Create Invitation', exact: true }));
    const previews = hero.locator('[class*="aspect-[5/7]"]');
    await expect(previews).toHaveCount(3);
    for (const preview of await previews.all()) await expectReadable(preview);
    for (const heading of await page.locator('main h2').all()) await expectReadable(heading);
  });
});
