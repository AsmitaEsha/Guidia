import { test, expect } from '@playwright/test';
import { registerAndOnboard } from './helpers';

// Screenshot checks at phone, tablet and desktop sizes, in light, dark and
// high contrast. First run: `npm run test:visual -- --update-snapshots`.
const SIZES = [
  { name: 'phone', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];
const PAGES = ['home', 'learn', 'safety', 'settings'];

test.describe.configure({ mode: 'serial' });

for (const size of SIZES) {
  test(`landing @ ${size.name}`, async ({ page }) => {
    await page.setViewportSize(size);
    await page.goto('/landing');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot(`landing-${size.name}.png`, { fullPage: false });
  });
}

test('signed-in pages across sizes and themes', async ({ page }) => {
  test.setTimeout(900_000);
  await registerAndOnboard(page);
  for (const theme of ['light', 'dark', 'contrast']) {
    if (theme !== 'light') {
      await page.goto('/app/settings');
      const label = theme === 'dark' ? /dark background/i : /high contrast/i;
      await page.getByRole('switch', { name: label }).click();
      await page.waitForTimeout(400);
    }
    for (const size of SIZES) {
      await page.setViewportSize(size);
      for (const route of PAGES) {
        await page.goto(`/app/${route}`);
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveScreenshot(`${route}-${size.name}-${theme}.png`, {
          // Greetings, dates and recommendations change between runs.
          mask: [page.locator('.home-hero .eyebrow'), page.locator('time'), page.locator('.text-subtle')],
        });
      }
    }
    if (theme === 'dark') {
      await page.goto('/app/settings');
      await page.getByRole('switch', { name: /dark background/i }).click();
    }
  }
});
