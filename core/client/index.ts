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
  beforeRequest: async (fetchOptions) => {
    // We can't serialize a `Headers` object within this method so we have to opt into using a plain object
    const requestHeaders: Record<string, string> = {};

    if (fetchOptions?.cache && ['no-store', 'no-cache'].includes(fetchOptions.cache)) {
      try {
        // headers() is a dynamic API unavailable inside unstable_cache; skip IP forwarding in that context
        const { headers } = await import('next/headers');

        const ipAddress = (await headers()).get('X-Forwarded-For');

        if (ipAddress) {
          requestHeaders['X-Forwarded-For'] = ipAddress;
          requestHeaders['True-Client-IP'] = ipAddress;
        }
      } catch {
        // Not in a request context (e.g. inside unstable_cache); IP forwarding not available
      }
    }

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
