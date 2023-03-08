import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

import { createStorefrontClient } from './storefront/client';

const storefrontClient = createStorefrontClient({
  accessToken: process.env.NEXT_PUBLIC_BIGCOMMERCE_ACCESS_TOKEN,
  channelId: parseInt(process.env.NEXT_PUBLIC_BIGCOMMERCE_CHANNEL_ID ?? '', 10),
  storeHash: process.env.NEXT_PUBLIC_BIGCOMMERCE_STORE_HASH,
  apiUrl: process.env.NEXT_PUBLIC_BIGCOMMERCE_API_URL,
  canonicalDomainName: process.env.NEXT_PUBLIC_BIGCOMMERCE_CANONICAL_STORE_DOMAIN,
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

export const serverClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache({
    typePolicies: {
      Site: {
        // Disables normalization for this type since it has no key fields (id):
        keyFields: false,
        // This states that the Site type is a root query:
        queryType: true,
      },
      Settings: {
        // Disables normalization for this type since it has no key fields (id):
        keyFields: false,
      },
    },
  }),
});
