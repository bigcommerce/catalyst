import { BigCommerceAuthError, createClient } from '@bigcommerce/catalyst-client';

import { getChannelIdFromLocale } from '../channels.config';
import { backendUserAgent } from '../user-agent';

import { getCorrelationId } from './correlation-id';

export const client = createClient({
  storefrontToken: process.env.BIGCOMMERCE_STOREFRONT_TOKEN ?? '',
  storeHash: process.env.BIGCOMMERCE_STORE_HASH ?? '',
  channelId: process.env.BIGCOMMERCE_CHANNEL_ID,
  backendUserAgentExtensions: backendUserAgent,
  logger:
    (process.env.NODE_ENV !== 'production' && process.env.CLIENT_LOGGER !== 'false') ||
    process.env.CLIENT_LOGGER === 'true',
  getChannelId: (defaultChannelId: string, locale?: string) => {
    return getChannelIdFromLocale(locale) ?? defaultChannelId;
  },
  // eslint-disable-next-line @typescript-eslint/require-await, @typescript-eslint/no-unused-vars
  beforeRequest: async (fetchOptions) => {
    // We can't serialize a `Headers` object within this method so we have to opt into using a plain object
    const requestHeaders: Record<string, string> = {};

    // Note: IP forwarding via headers() was removed because headers() cannot be called inside
    // 'use cache' contexts (throws an uncatchable error in Next.js 16 with cacheComponents).
    // Since cached responses are shared across users, IP forwarding is not meaningful there.
    // For authenticated (non-cached) requests, IP forwarding should be handled at the middleware level.

    requestHeaders['X-Correlation-ID'] = getCorrelationId();

    return {
      headers: requestHeaders,
    };
  },
  onError: async (error, queryType) => {
    if (error instanceof BigCommerceAuthError && queryType === 'query') {
      const { redirect } = await import('next/navigation');

      redirect('/api/auth/signout');
    }
  },
});
