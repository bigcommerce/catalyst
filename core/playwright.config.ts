import { defineConfig, devices } from '@playwright/test';

import { testEnv } from '~/tests/environment';

export default defineConfig({
  testDir: './tests',
  outputDir: './.tests/test-results',
  timeout: testEnv.PLAYWRIGHT_TEST_TIMEOUT,
  expect: {
    timeout: testEnv.PLAYWRIGHT_TEST_EXPECT_TIMEOUT,
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
      'x-vercel-protection-bypass': testEnv.VERCEL_PROTECTION_BYPASS ?? '',
      'x-vercel-set-bypass-cookie': testEnv.CI.toString(),
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
  ...(testEnv.PLAYWRIGHT_START_WEBSERVER && {
    webServer: {
      command: testEnv.PLAYWRIGHT_START_WEBSERVER_COMMAND,
      url: testEnv.PLAYWRIGHT_TEST_BASE_URL,
      reuseExistingServer: !testEnv.CI,
      stdout: 'ignore',
      stderr: 'pipe',
    },
  }),
});
