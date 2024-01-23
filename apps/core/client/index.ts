import { createClient } from '@bigcommerce/catalyst-client';

import { backendUserAgent } from '../userAgent';

export const client = createClient({
  customerImpersonationToken: process.env.BIGCOMMERCE_CUSTOMER_IMPERSONATION_TOKEN ?? '',
  xAuthToken: process.env.BIGCOMMERCE_ACCESS_TOKEN ?? '',
  storeHash: process.env.BIGCOMMERCE_STORE_HASH ?? '',
  channelId: process.env.BIGCOMMERCE_CHANNEL_ID,
  backendUserAgentExtensions: backendUserAgent,
  logger: process.env.NODE_ENV !== 'production' || process.env.CLIENT_LOGGER === 'true',
});
