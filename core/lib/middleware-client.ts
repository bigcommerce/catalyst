import { createClient } from '@bigcommerce/catalyst-client';

import { fetch as cachedFetch } from '~/lib/fetch';

/**
 * Creates a BigCommerce client configured to use cached fetch adapters
 * instead of relying on Next.js Data Cache which isn't available in middleware
 */
export function createMiddlewareClient() {
  return createClient({
    storefrontToken: process.env.BIGCOMMERCE_STOREFRONT_TOKEN ?? '',
    storeHash: process.env.BIGCOMMERCE_STORE_HASH ?? '',
    channelId: process.env.BIGCOMMERCE_CHANNEL_ID,
    logger:
      (process.env.NODE_ENV !== 'production' && process.env.CLIENT_LOGGER !== 'false') ||
      process.env.CLIENT_LOGGER === 'true',
    fetch: cachedFetch.fetch,
  });
}