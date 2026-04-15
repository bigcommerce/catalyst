import { BigCommerceAuthError, createClient } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { backendUserAgent } from '../user-agent';

const getCorrelationId = cache((): string => crypto.randomUUID());

export const client = createClient({
  storefrontToken: process.env.BIGCOMMERCE_STOREFRONT_TOKEN ?? '',
  storeHash: process.env.BIGCOMMERCE_STORE_HASH ?? '',
  channelId: process.env.BIGCOMMERCE_CHANNEL_ID ?? '',
  backendUserAgentExtensions: backendUserAgent,
  // Map locales to alternate channel IDs for multi-storefront setups:
  // channelIdsByLocale: { es: '456', fr: '789' },
  logger:
    (process.env.NODE_ENV !== 'production' && process.env.CLIENT_LOGGER !== 'false') ||
    process.env.CLIENT_LOGGER === 'true',
  getHeaders: () => ({
    'X-Correlation-ID': getCorrelationId(),
  }),
  onError: async (error, queryType) => {
    if (error instanceof BigCommerceAuthError && queryType === 'query') {
      const { redirect } = await import('next/navigation');

      redirect('/api/auth/signout');
    }
  },
});
