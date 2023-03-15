import { ClientConfig, Config } from './config';

interface StorefrontTokenResponse {
  data: {
    token: string;
  };
  meta: unknown;
}

export const createStorefrontClient = (config: Partial<Config>) => {
  const clientConfig = new ClientConfig(config);

  // We want to warn the user that this client should not be used in the browser, but only in development.
  if (process.env.NODE_ENV === 'development' && Boolean(globalThis.document)) {
    // eslint-disable-next-line no-console
    console.error(
      'Using the StorefrontClient in the browser is not recommended as it can expose your secrets in the browser.',
    );
  }

  const fetchStorefrontToken = async () => {
    const response = await fetch(
      `${clientConfig.apiUrl}/stores/${clientConfig.storeHash}/v3/storefront/api-token-customer-impersonation`,
      {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          'x-auth-token': clientConfig.accessToken,
        },
        body: JSON.stringify({
          channel_id: clientConfig.channelId,
          expires_at: Math.floor(new Date().getTime() / 1000) + 1 * 24 * 60 * 60, // 1 day
        }),
      },
    );

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return (await response.json()) as StorefrontTokenResponse;
  };

  return {
    getStorefrontApiUrl() {
      const channelIdSegment = clientConfig.channelId !== 1 ? `-${clientConfig.channelId}` : '';

      return `https://store-${clientConfig.storeHash}${channelIdSegment}.${clientConfig.canonicalDomainName}/graphql`;
    },
    async getStorefrontApiHeaders() {
      const {
        data: { token },
      } = await fetchStorefrontToken();

      return {
        accept: 'application/json',
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      };
    },
  };
};

export const storefrontClient = createStorefrontClient({
  accessToken: process.env.NEXT_PUBLIC_BIGCOMMERCE_ACCESS_TOKEN,
  channelId: parseInt(process.env.NEXT_PUBLIC_BIGCOMMERCE_CHANNEL_ID ?? '', 10),
  storeHash: process.env.NEXT_PUBLIC_BIGCOMMERCE_STORE_HASH,
  apiUrl: process.env.NEXT_PUBLIC_BIGCOMMERCE_API_URL,
  canonicalDomainName: process.env.NEXT_PUBLIC_BIGCOMMERCE_CANONICAL_STORE_DOMAIN,
});

const createQueryClient = () => {
  return {
    async query<ResponseType>(query: string, variables: Record<string, unknown> = {}) {
      const response = await fetch(storefrontClient.getStorefrontApiUrl(), {
        method: 'POST',
        headers: await storefrontClient.getStorefrontApiHeaders(),
        body: JSON.stringify({ query, variables }),
      });

      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return (await response.json()) as ResponseType;
    },
  };
};

export const http = createQueryClient();
