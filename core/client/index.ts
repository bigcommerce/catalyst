import { BigCommerceAuthError, createClient } from '@bigcommerce/catalyst-client';
import { headers } from 'next/headers';
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { redirect } from 'next/navigation';
import { getLocale as getServerLocale } from 'next-intl/server';

import { getChannelIdFromLocale } from '../channels.config';
import { backendUserAgent } from '../userAgent';

const getLocale = async () => {
  try {
    const locale = await getServerLocale();

    return locale;
  } catch {
    /**
     * Next-intl `getLocale` only works on the server, and when middleware has run.
     *
     * Instances when `getLocale` will not work:
     * - Requests in middlewares
     * - Requests in `generateStaticParams`
     * - Request in api routes
     * - Requests in static sites without `setRequestLocale`
     */
  }
};

export const client = createClient({
  storefrontToken: process.env.BIGCOMMERCE_STOREFRONT_TOKEN ?? '',
  xAuthToken: process.env.BIGCOMMERCE_ACCESS_TOKEN ?? '',
  storeHash: process.env.BIGCOMMERCE_STORE_HASH ?? '',
  channelId: process.env.BIGCOMMERCE_CHANNEL_ID,
  backendUserAgentExtensions: backendUserAgent,
  logger:
    (process.env.NODE_ENV !== 'production' && process.env.CLIENT_LOGGER !== 'false') ||
    process.env.CLIENT_LOGGER === 'true',
  getChannelId: async (defaultChannelId: string) => {
    const locale = await getLocale();

    // We use the default channelId as a fallback, but it is not ideal in some scenarios.
    return getChannelIdFromLocale(locale) ?? defaultChannelId;
  },
  beforeRequest: async (fetchOptions) => {
    // We can't serialize a `Headers` object within this method so we have to opt into using a plain object
    const requestHeaders: Record<string, string> = {};

    if (fetchOptions?.cache && ['no-store', 'no-cache'].includes(fetchOptions.cache)) {
      const ipAddress = (await headers()).get('X-Forwarded-For');

      if (ipAddress) {
        requestHeaders['X-Forwarded-For'] = ipAddress;
        requestHeaders['True-Client-IP'] = ipAddress;
      }
    }

    return {
      headers: requestHeaders,
    };
  },
  onError: (error, queryType) => {
    if (error instanceof BigCommerceAuthError && queryType === 'query') {
      redirect('?invalidate-session');
    }
  },
});
