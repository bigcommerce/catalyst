import { createEnv } from '@t3-oss/env-core';
import { config as dotenvConfig } from 'dotenv';
import { z } from 'zod/v4';

dotenvConfig({ path: ['.env', '.env.local', '.env.test'], override: true });

export const testEnv = createEnv({
  server: {
    BIGCOMMERCE_ADMIN_API_HOST: z.string().optional().default('api.bigcommerce.com'),
    BIGCOMMERCE_ACCESS_TOKEN: z.string().optional(),
    BIGCOMMERCE_ACCESS_TOKEN_CLIENT_ID: z.string().optional(),
    BIGCOMMERCE_ACCESS_TOKEN_CLIENT_SECRET: z.string().optional(),
    BIGCOMMERCE_CHANNEL_ID: z.coerce.number().optional(),
    BIGCOMMERCE_STORE_HASH: z.string().optional(),
    PLAYWRIGHT_TEST_BASE_URL: z.string().optional().default('http://localhost:3000'),
    VERCEL_PROTECTION_BYPASS: z.string().optional().default(''),
    CI: z.stringbool().optional().default(false),
    TESTS_READ_ONLY: z.stringbool().optional().default(false),
    TESTS_LOCALE: z.string(),
    TESTS_FALLBACK_LOCALE: z.string(),
    TEST_CUSTOMER_ID: z.coerce.number().optional(),
    TEST_CUSTOMER_EMAIL: z.string().optional(),
    TEST_CUSTOMER_PASSWORD: z.string().optional(),
    DEFAULT_PRODUCT_ID: z.coerce.number().optional(),
    DEFAULT_COMPLEX_PRODUCT_ID: z.coerce.number().optional(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
