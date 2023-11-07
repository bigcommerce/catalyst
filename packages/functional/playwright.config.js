import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';

config();

export default defineConfig({
  testDir: './tests',
  timeout: 120 * 1000,
  expect: {
    timeout: 20000,
    toHaveScreenshot: { maxDiffPixels: 100 },
  },
  fullyParallel: true,
  reporter: 'html',
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL,
  },

  projects: [
    {
      name: 'tests-chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: [
            '--font-render-hinting=none',
            '--disable-skia-runtime-opts',
            '--disable-system-font-check',
            '--disable-font-subpixel-positioning',
            '--disable-lcd-text',
            '--disable-remote-fonts',
          ],
        }
      },
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
