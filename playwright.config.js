// End-to-end tests against a running storefront.
// Default target is `shopify theme dev` (http://127.0.0.1:9292). To test a password-protected
// store instead, set BASE_URL and STORE_PASSWORD. Set PW_CHANNEL=msedge or chrome to reuse an
// installed browser instead of running `npx playwright install chromium`.
const { defineConfig, devices } = require('@playwright/test');

const channel = process.env.PW_CHANNEL || undefined;

module.exports = defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 2,
  retries: 1,
  reporter: [['list']],
  use: {
    baseURL: process.env.BASE_URL || 'http://127.0.0.1:9292',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], channel } },
    { name: 'mobile', use: { ...devices['Pixel 7'], channel } },
  ],
});
