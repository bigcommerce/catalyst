import { createClient } from '@bigcommerce/catalyst-client';

const client = createClient({
  key: process.env.BIGCOMMERCE_CUSTOMER_IMPERSONATION_TOKEN ?? '',
  storeHash: process.env.BIGCOMMERCE_STORE_HASH ?? '',
  xAuthToken: process.env.BIGCOMMERCE_ACCESS_TOKEN ?? '',
  channelId: process.env.BIGCOMMERCE_CHANNEL_ID,
});

export default client;
