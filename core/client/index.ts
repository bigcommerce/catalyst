import { createClient } from '@bigcommerce/catalyst-client';
import { getLocale } from 'next-intl/server';

import { getChannelIdFromLocale } from '~/lib/utils';

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
  getChannelId: async () => {
    const locale = await getLocale();

    return getChannelIdFromLocale(locale);
  },
});
