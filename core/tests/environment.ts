import { createEnv } from '@t3-oss/env-core';
import { config as dotenvConfig } from 'dotenv';
import { z } from 'zod/v4';

dotenvConfig({ path: ['.env', '.env.local', '.env.test'], override: true });

// Locales are merchant configuration resolved at runtime, so there is no build-time list to
// validate against here. `~/tests/lib/locale` resolves the locale's URL subfolder from the store.
const localeSchema = z.string().min(1);

export const testEnv = createEnv({
  server: {
    BIGCOMMERCE_ADMIN_API_HOST: z.string().optional().default('api.bigcommerce.com'),
    BIGCOMMERCE_ACCESS_TOKEN: z.string().optional(),
    BIGCOMMERCE_ACCESS_TOKEN_CLIENT_ID: z.string().optional(),
    BIGCOMMERCE_ACCESS_TOKEN_CLIENT_SECRET: z.string().optional(),
    BIGCOMMERCE_CHANNEL_ID: z.coerce.number().optional(),
    BIGCOMMERCE_STORE_HASH: z.string().optional(),
    BIGCOMMERCE_STOREFRONT_TOKEN: z.string().optional(),
    BIGCOMMERCE_GRAPHQL_API_DOMAIN: z.string().optional().default('mybigcommerce.com'),
    PLAYWRIGHT_TEST_BASE_URL: z.string().optional().default('http://localhost:3000'),
    VERCEL_PROTECTION_BYPASS: z.string().optional().default(''),
    CI: z.stringbool().optional().default(false),
    TESTS_READ_ONLY: z.stringbool().optional().default(false),
    TESTS_LOCALE: localeSchema.default('en'),
    TESTS_FALLBACK_LOCALE: localeSchema.default('en'),
    TEST_CUSTOMER_ID: z.coerce.number().optional(),
    TEST_CUSTOMER_EMAIL: z.string().optional(),
    TEST_CUSTOMER_PASSWORD: z.string().optional(),
    DEFAULT_PRODUCT_ID: z.coerce.number().optional(),
    DEFAULT_COMPLEX_PRODUCT_ID: z.coerce.number().optional(),
    TRAILING_SLASH: z.stringbool().optional().default(true),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
