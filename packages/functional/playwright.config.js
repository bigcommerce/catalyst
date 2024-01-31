import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';

config();

export default defineConfig({
  testDir: './tests',
  expect: {
    toHaveScreenshot: { maxDiffPixels: 100 },
  },
  fullyParallel: true,
  reporter: 'html',
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'tests-chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'tests-firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'tests-webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
