import { expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

export const APP_ROUTES = ['home', 'ask', 'screen', 'learn', 'practice', 'safety', 'memory', 'progress', 'people', 'help', 'notifications', 'settings'];

// Registers a brand-new account through the real form and finishes
// onboarding, so tests never depend on pre-existing credentials.
export async function registerAndOnboard(page) {
  const email = `e2e.${Date.now()}.${Math.random().toString(36).slice(2, 7)}@test.guidia`;
  await page.goto('/register');
  await page.getByLabel(/full name/i).fill('Test Learner');
  await page.getByLabel(/email address/i).fill(email);
  await page.locator('#password').fill('Passw0rdX1');
  await page.locator('input[autocomplete="new-password"]').nth(1).fill('Passw0rdX1');
  await page.getByRole('button', { name: /create account/i }).click();
  await page.waitForURL('**/onboarding');
  for (let i = 0; i < 3; i += 1) await page.getByRole('button', { name: /continue/i }).click();
  await page.getByRole('button', { name: /start using guidia/i }).click();
  await page.waitForURL('**/app/home', { timeout: 15_000 });
  return email;
}

/** Fails on serious/critical axe violations, listing them readably. */
export async function expectAccessible(page, label) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .disableRules(['region']) // decorative demo frames sit outside landmarks by design
    .analyze();
  const serious = results.violations.filter((v) => ['serious', 'critical'].includes(v.impact));
  const summary = serious.map((v) => `${v.id} (${v.impact}): ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`);
  expect(summary, `axe violations on ${label}`).toEqual([]);
}

/** No page-level horizontal scrolling. */
export async function expectNoHorizontalScroll(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}
