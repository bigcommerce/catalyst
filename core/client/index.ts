import { createClient } from '@bigcommerce/catalyst-client';
import { getLocale } from 'next-intl/server';

import { getChannelIdFromLocale } from '~/channels.config';

import { backendUserAgent } from '../userAgent';

export const client = createClient({
  customerImpersonationToken: process.env.BIGCOMMERCE_CUSTOMER_IMPERSONATION_TOKEN ?? '',
  xAuthToken: process.env.BIGCOMMERCE_ACCESS_TOKEN ?? '',
  storeHash: process.env.BIGCOMMERCE_STORE_HASH ?? '',
  channelId: process.env.BIGCOMMERCE_CHANNEL_ID,
  backendUserAgentExtensions: backendUserAgent,
  logger:
    (process.env.NODE_ENV !== 'production' && process.env.CLIENT_LOGGER !== 'false') ||
    process.env.CLIENT_LOGGER === 'true',
  getChannelId: async (defaultChannelId: string) => {
    /**
     * Next-intl `getLocale` only works on the server, and when middleware has run.
     *
     * Instances when `getLocale` will not work:
     * - Requests in middlewares
     * - Requests in `generateStaticParams`
     * - Request in api routes
     * - Requests in static sites without `unstable_setRequestLocale`
     *
     * We use the default channelId as a fallback, but it is not ideal in some scenarios.
     *  */
    try {
      const locale = await getLocale();

      return getChannelIdFromLocale(locale) ?? defaultChannelId;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error using `getLocale`, using default channel id instead.');

      return defaultChannelId;
    }
  },
});
