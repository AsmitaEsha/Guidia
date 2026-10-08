// Browser smoke, accessibility and visual checks.
//   npm run test:e2e            smoke + axe (needs the API and web dev servers)
//   npm run test:visual         screenshot comparisons at phone/tablet/desktop
// Uses the locally installed Microsoft Edge, so no browser download is needed
// (set E2E_CHANNEL=chrome to use Chrome instead).
import { defineConfig } from '@playwright/test';

const channel = process.env.E2E_CHANNEL || 'msedge';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 10_000, toHaveScreenshot: { maxDiffPixelRatio: 0.02, animations: 'disabled' } },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:5173',
    channel,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    { name: 'smoke', testMatch: /smoke\.spec\.js/ },
    { name: 'visual', testMatch: /visual\.spec\.js/ },
  ],
});
