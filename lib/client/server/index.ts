import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

import { createStorefrontClient } from './storefront/client';

const storefrontClient = createStorefrontClient({
  accessToken: process.env.BIGCOMMERCE_ACCESS_TOKEN,
  channelId: parseInt(process.env.BIGCOMMERCE_CHANNEL_ID ?? '', 10),
  storeHash: process.env.BIGCOMMERCE_STORE_HASH,
  apiUrl: process.env.BIGCOMMERCE_API_URL,
  canonicalDomainName: process.env.BIGCOMMERCE_CANONICAL_STORE_DOMAIN,
});

const authLink = setContext(async () => {
  const storefrontClientHeaders = await storefrontClient.getStorefrontApiHeaders();

  return {
    headers: {
      ...storefrontClientHeaders,
    },
  };
});

const httpLink = new HttpLink({
  uri: storefrontClient.getStorefrontApiUrl(),
});

// We want to return a new client for each request server-side. InMemoryCache was designed
// to be used in a single client instance. If we were to use the same client instance for
// multiple requests, the cache would be shared between requests and cause caching issues.
export const getServerClient = () => {
  if (typeof window !== 'undefined') {
    throw new Error(
      'getServerClient is only for use in the browser. Use getBrowserClient for server requests.',
    );
  }

  return new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
  });
};
