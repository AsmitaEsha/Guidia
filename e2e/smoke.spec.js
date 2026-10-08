import { test, expect } from '@playwright/test';
import { APP_ROUTES, expectAccessible, expectNoHorizontalScroll, registerAndOnboard } from './helpers';

test.describe.configure({ mode: 'serial' });

test.describe('public pages', () => {
  test('landing renders, demos work, and is accessible', async ({ page }) => {
    await page.goto('/landing');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/understandable/i);
    await page.getByRole('button', { name: /see guidia in action/i }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('tab', { name: /protect/i }).click();
    await dialog.getByRole('button', { name: /check this message/i }).click();
    await expect(dialog.getByText(/stop — very risky/i).first()).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expectAccessible(page, 'landing');
    await expectNoHorizontalScroll(page);
  });

  test('auth pages are accessible', async ({ page }) => {
    for (const path of ['/login', '/register', '/forgot-password', '/reset-password']) {
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expectAccessible(page, path);
    }
  });

  test('showcase steps forward with the keyboard', async ({ page }) => {
    await page.goto('/showcase');
    await expect(page.getByText(/the problem/i).first()).toBeVisible();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByText(/meet guidia/i).first()).toBeVisible();
    await expectAccessible(page, 'showcase');
  });

  test('unknown pages show the not-found page', async ({ page }) => {
    await page.goto('/this-does-not-exist');
    await expect(page.getByText(/couldn't find that page/i)).toBeVisible();
  });
});

test.describe('signed-in product', () => {
  test('a new user can register, onboard, and visit every page', async ({ page }) => {
    test.setTimeout(300_000);
    await registerAndOnboard(page);
    for (const route of APP_ROUTES) {
      await page.goto(`/app/${route}`);
      await expect(page.locator('#main').getByRole('heading', { level: 1 }).first()).toBeVisible({ timeout: 15_000 });
      await expect(page.getByText(/something on this page stopped working/i)).toHaveCount(0);
      await expectAccessible(page, `/app/${route}`);
      await expectNoHorizontalScroll(page);
    }
  });

  test('a new lesson can be completed end to end', async ({ page }) => {
    await registerAndOnboard(page);
    await page.goto('/app/learn/imo-voice-message');
    for (let i = 0; i < 3; i += 1) await page.getByRole('button', { name: /next step/i }).click();
    await page.getByRole('button', { name: /i did it/i }).click();
    await page.getByRole('radio', { name: /i feel confident/i }).click();
    await expect(page.getByText(/lesson complete/i)).toBeVisible();
    await page.goto('/app/memory');
    await expect(page.getByText(/voice message/i).first()).toBeVisible();
  });

  test('mobile layout uses the bottom navigation and More sheet', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await registerAndOnboard(page);
    const bottom = page.getByRole('navigation', { name: /main menu/i }).last();
    await expect(bottom).toBeVisible();
    await bottom.getByRole('button', { name: /more/i }).click();
    await expect(page.getByRole('dialog', { name: /more/i })).toBeVisible();
    await page.getByRole('dialog').getByRole('link', { name: /settings/i }).click();
    await page.waitForURL('**/app/settings');
    await expectNoHorizontalScroll(page);
  });
});
