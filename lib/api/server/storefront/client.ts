import { clientConfig } from '../config';

interface StorefrontTokenResponse {
  data: {
    token: string;
  };
  meta: unknown;
}

export const createStorefrontClient = () => {
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
