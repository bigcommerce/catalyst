/* eslint-disable no-console */
import { config as dotenvConfig } from 'dotenv';
import { z } from 'zod';

import { defaultLocale, locales } from '~/i18n/locales';

dotenvConfig({ path: ['.env', '.env.local', '.env.test'], override: true });

const types = {
  string: z.string().optional(),
  bool: z
    .string()
    .transform((v: string) => ['1', 'true', 'yes'].includes(v))
    .optional()
    .default('false'),
  number: z.number({ coerce: true }).optional(),
  locale: z.string().transform((v: string, ctx) => {
    if (!locales.includes(v)) {
      ctx.addIssue({
        code: 'custom',
        message: `${v} is not a valid value for TESTS_LOCALE environment variable. TESTS_LOCALE must be one of: ${locales.join(', ')}`,
      });

      return z.NEVER;
    }

    return v;
  }),
};

const schema = z.object({
  BIGCOMMERCE_ADMIN_API_HOST: types.string.default('api.bigcommerce.com'),
  BIGCOMMERCE_ACCESS_TOKEN: types.string,
  BIGCOMMERCE_ACCESS_TOKEN_CLIENT_ID: types.string,
  BIGCOMMERCE_ACCESS_TOKEN_CLIENT_SECRET: types.string,
  BIGCOMMERCE_CHANNEL_ID: types.number,
  BIGCOMMERCE_STORE_HASH: types.string,
  PLAYWRIGHT_TEST_BASE_URL: types.string.default('http://localhost:3000'),
  PLAYWRIGHT_TEST_TIMEOUT: types.number.default(30000),
  PLAYWRIGHT_TEST_EXPECT_TIMEOUT: types.number.default(30000),
  PLAYWRIGHT_START_WEBSERVER: types.bool,
  PLAYWRIGHT_START_WEBSERVER_COMMAND: types.string.default('pnpm start'),
  VERCEL_PROTECTION_BYPASS: types.string,
  CI: types.bool,
  TESTS_READ_ONLY: types.bool.default('false'),
  TESTS_LOCALE: types.locale.default(defaultLocale),
  TESTS_FALLBACK_LOCALE: types.locale.default(defaultLocale),
  TEST_CUSTOMER_ID: types.number,
  TEST_CUSTOMER_EMAIL: types.string,
  TEST_CUSTOMER_PASSWORD: types.string,
  DEFAULT_PRODUCT_ID: types.number,
});

function parseConfig(env: NodeJS.ProcessEnv) {
  try {
    return schema.parse(env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((e) => `  - ${e.path.join('.')}: ${e.message}`).join('\n');

      console.error(`Test environment configuration is invalid\n`, errors);
    } else {
      console.error('Test environment setup failed', error);
    }

    process.exit(1);
  }
}

export const testEnv = parseConfig(process.env);
