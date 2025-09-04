import { defineConfig, devices } from '@playwright/test';

import { testEnv } from '~/tests/environment';

export default defineConfig({
  testDir: './tests',
  outputDir: './.tests/test-results',
  workers: 1, // TODO: Implement parallel workers in the future
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.02,
    },
  },
  reporter: [
    ['list', { outputFolder: './.tests/reports/list' }],
    ['html', { outputFolder: './.tests/reports/html' }],
  ],
  use: {
    locale: testEnv.TESTS_LOCALE,
    baseURL: testEnv.PLAYWRIGHT_TEST_BASE_URL,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    extraHTTPHeaders: {
      'x--protection-bypass': testEnv._PROTECTION_BYPASS,
      'x--set-bypass-cookie': testEnv.CI.toString(),
    },
  },
  projects: [
    {
      name: 'tests-chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          // When redirected to checkout, BigCommerce blocks preflight requests from a HeadlessChrome user agent.
          // We need to disable web security to allow the preflight request to go through.
          args: ['--disable-web-security'],
        },
      },
    },
  ],
  retries: 1,
});
