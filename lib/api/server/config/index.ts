import { ClientConfig } from './config';

// We want to warn the user that this client should not be used in the browser, but only in development.
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // eslint-disable-next-line no-console
  console.error(
    'Using the StorefrontClient in the browser is not recommended as it can expose your secrets in the browser.',
  );
}

const config = {
  accessToken: process.env.BIGCOMMERCE_ACCESS_TOKEN,
  channelId: parseInt(process.env.BIGCOMMERCE_CHANNEL_ID ?? '', 10),
  storeHash: process.env.BIGCOMMERCE_STORE_HASH,
  apiUrl: process.env.BIGCOMMERCE_API_URL,
  canonicalDomainName: process.env.BIGCOMMERCE_CANONICAL_STORE_DOMAIN,
};

export const clientConfig = new ClientConfig(config);
