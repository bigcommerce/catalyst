import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

import { createStorefrontClient } from './storefront/client';

const storefrontClient = createStorefrontClient();

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
      'getServerClient is only for use in the server. Use getBrowserClient for browser requests.',
    );
  }

  return new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
  });
};
