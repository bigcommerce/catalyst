import { createClient } from '@bigcommerce/catalyst-client';
import { createClient as createNewClient } from './new/index';

const client = createClient({
  key: process.env.BIGCOMMERCE_CUSTOMER_IMPERSONATION_TOKEN ?? '',
  storeHash: process.env.BIGCOMMERCE_STORE_HASH ?? '',
  xAuthToken: process.env.BIGCOMMERCE_ACCESS_TOKEN ?? '',
  channelId: process.env.BIGCOMMERCE_CHANNEL_ID,
});

export const newClient = createNewClient({
  customerImpersonationToken: process.env.BIGCOMMERCE_CUSTOMER_IMPERSONATION_TOKEN ?? '',
  xAuthToken: process.env.BIGCOMMERCE_ACCESS_TOKEN ?? '',
  storeHash: process.env.BIGCOMMERCE_STORE_HASH ?? '',
  channelId: process.env.BIGCOMMERCE_CHANNEL_ID,
  logger: process.env.NODE_ENV !== 'production' || process.env.CLIENT_LOGGER === 'true',
});

export default client;
