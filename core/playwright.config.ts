import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';
import { CoverageReportOptions } from 'monocart-reporter';

config();

const coverageReportOptions: CoverageReportOptions = {
  name: 'Catalyst Code Coverage Report',

  entryFilter: (entry) => {
    return entry.url.includes('next/static/chunks') || entry.url.includes('next/server/app');
  },

  sourceFilter: (sourcePath) => {
    return (
      sourcePath.startsWith('bigcommerce/catalyst-core') &&
      (sourcePath.endsWith('.ts') || sourcePath.endsWith('.tsx'))
    );
  },

  sourcePath: (fileSource) => {
    const list = ['core/'];

    // eslint-disable-next-line no-restricted-syntax
    for (const pre of list) {
      if (fileSource.startsWith(pre)) {
        return fileSource.slice(pre.length);
      }
    }

    return fileSource;
  },
  reports: ['v8'],
};

export default defineConfig({
  testDir: './tests',
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.02,
    },
  },
  reporter: process.env.CI
    ? [['list'], ['monocart-reporter']]
    : [
        ['list'],
        [
          'monocart-reporter',
          {
            coverage: coverageReportOptions,
          },
        ],
      ],
  globalTeardown: './tests/global-teardown.js',
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    extraHTTPHeaders: {
      'x-vercel-protection-bypass': process.env.VERCEL_PROTECTION_BYPASS || '',
      'x-vercel-set-bypass-cookie': process.env.CI ? 'true' : 'false',
    },
  },
  projects: [
    {
      name: 'tests-chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
