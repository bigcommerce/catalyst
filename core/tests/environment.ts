import { createEnv } from '@t3-oss/env-core';
import { config as dotenvConfig } from 'dotenv';
import { z } from 'zod/v4';

import { defaultLocale, locales } from '~/i18n/locales';

dotenvConfig({ path: ['.env', '.env.local', '.env.test'], override: true });

const localeSchema = z.string().refine((val: string) => locales.includes(val), {
  error: `TESTS_LOCALE must be one of: ${locales.join(', ')}`,
});

const newLocal = 'https://api.bigcommerce.com/stores/1d8l3jduoc/v3/';
export const testEnv = createEnv({
  server: {
    BIGCOMMERCE_ADMIN_API_HOST: z.string().optional().default(newLocal),
    BIGCOMMERCE_ACCESS_TOKEN: z.string().optional().default('hkf3yamlrmup8awfaw75nrsnlrark2'),
    BIGCOMMERCE_ACCESS_TOKEN_CLIENT_ID: z.string().optional().default('4gxddoqef3lh2hctcohruoo89uiakqo'),
    BIGCOMMERCE_ACCESS_TOKEN_CLIENT_SECRET: z.string().optional().default('17245bd15567a7648e761d98cd746923261a5a8dcd5595da39775669c71bffb2'),
    BIGCOMMERCE_CHANNEL_ID: z.coerce.number(1780930).optional(),
    BIGCOMMERCE_STORE_HASH: z.string().min(1).max(255).optional().default('1d8l3jduoc'),
    PLAYWRIGHT_TEST_BASE_URL: z.string().optional().default('http://localhost:3000'),
    _PROTECTION_BYPASS: z.string().optional().default(''),
    CI: z.stringbool().optional().default(false),
    TESTS_READ_ONLY: z.stringbool().optional().default(false),
    TESTS_LOCALE: localeSchema.default(defaultLocale),
    TESTS_FALLBACK_LOCALE: localeSchema.default(defaultLocale),
    TEST_CUSTOMER_ID: z.coerce.number().optional(),
    TEST_CUSTOMER_EMAIL: z.string().optional(),
    TEST_CUSTOMER_PASSWORD: z.string().optional(),
    DEFAULT_PRODUCT_ID: z.coerce.number().optional(),
    DEFAULT_COMPLEX_PRODUCT_ID: z.coerce.number().optional(),
    MAKESWIFT_SITE_API_KEY: z.string().optional().default('c5158450-d593-404d-b926-4bf0236f8184'),
    TRAILING_SLASH: z.string().optional().default('False'),
    TURBO_REMOTE_CACHE_SIGNATURE_KEY : z.string().optional().default('325becbad4156033461cd650d25942024c3cbb4a78b1d866cecda358776e977c90bfa3f1b2d349075aea3bae32d5b592274b18e9f64fe6562ab38baa3d54b15b'),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
