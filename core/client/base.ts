/**
 * Base client configuration and instance for BigCommerce API access.
 *
 * This module intentionally avoids importing any Next.js runtime APIs
 * (`next/headers`, `next/navigation`) or `next-intl/server`. In Next.js 16,
 * importing those modules during config resolution (i.e., from `next.config.ts`)
 * poisons the process-wide AsyncLocalStorage context and causes
 * "workUnitAsyncStorage" invariant errors at runtime.
 *
 * - `baseClientConfig` — shared configuration object (env vars + logger).
 *   Re-used by `./index.ts` to build the full client with request hooks.
 * - `baseClient` — a ready-to-use client instance without hooks.
 *   Safe to import from `next.config.ts` and other non-request contexts.
 */
import { createClient } from '@bigcommerce/catalyst-client';

import { backendUserAgent } from '../user-agent';

type ClientConfig = Parameters<typeof createClient>[0];

export const baseClientConfig = {
  storefrontToken: process.env.BIGCOMMERCE_STOREFRONT_TOKEN ?? '',
  storeHash: process.env.BIGCOMMERCE_STORE_HASH ?? '',
  channelId: process.env.BIGCOMMERCE_CHANNEL_ID,
  backendUserAgentExtensions: backendUserAgent,
  logger:
    (process.env.NODE_ENV !== 'production' && process.env.CLIENT_LOGGER !== 'false') ||
    process.env.CLIENT_LOGGER === 'true',
} satisfies Partial<ClientConfig>;

export const baseClient = createClient(baseClientConfig);
