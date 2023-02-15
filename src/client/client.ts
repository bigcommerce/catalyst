import { ClientConfig, Config } from './config';

interface StorefrontTokenResponse {
  data: {
    token: string;
  };
  meta: unknown;
}

const getExpiresAtUTCTime = (expiresAt: number): number => {
  const today = new Date();
  const tomorrow = new Date(today);

  tomorrow.setSeconds(today.getSeconds() + expiresAt);

  return Math.floor(tomorrow.getTime() / 1000);
};

// TODO: Check if we can use Apollo Client instead of this custom client
class ApiClient {
  private readonly config: ClientConfig;
  private readonly apiUrl: string;
  private readonly storefrontApiUrl: string;

  constructor(config: Partial<Config>) {
    this.config = new ClientConfig(config);

    this.apiUrl = this.generateApiUrl();
    this.storefrontApiUrl = this.generateStorefrontApiUrl();
  }

  async fetch(endpoint: string, options?: RequestInit) {
    return fetch(`${this.apiUrl}${endpoint}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Auth-Token': this.config.accessToken,
        ...options?.headers,
      },
    });
  }

  async query<ResponseType>(query: string): Promise<ResponseType> {
    const {
      data: { token },
    } = await this.generateStorefrontToken();

    const response = await fetch(this.storefrontApiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return (await response.json()) as ResponseType;
  }

  private generateApiUrl() {
    // TODO: Pass this into the constructor and validate it?
    const bcApiUrl = process.env.NEXT_PUBLIC_BIGCOMMERCE_API_URL ?? 'https://api.bigcommerce.com';

    return `${bcApiUrl}/stores/${this.config.storeHash}`;
  }

  private generateStorefrontApiUrl() {
    const channelIdSegment = this.config.channelId !== 1 ? `-${this.config.channelId}` : '';
    const canonicalStoreDomain =
      process.env.NEXT_PUBLIC_BIGCOMMERCE_CANONICAL_STORE_DOMAIN ?? 'mybigcommerce.com';

    return `https://store-${this.config.storeHash}${channelIdSegment}.${canonicalStoreDomain}/graphql`;
  }

  private async generateStorefrontToken() {
    const response = await this.fetch(`/v3/storefront/api-token-customer-impersonation`, {
      method: 'POST',
      headers: {
        'x-bc-customer-id': '',
      },
      body: JSON.stringify({
        channel_id: this.config.channelId,
        expires_at: getExpiresAtUTCTime(300),
      }),
    });

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return (await response.json()) as StorefrontTokenResponse;
  }
}

export const http = new ApiClient({
  accessToken: process.env.NEXT_PUBLIC_BIGCOMMERCE_ACCESS_TOKEN,
  channelId: parseInt(process.env.NEXT_PUBLIC_BIGCOMMERCE_CHANNEL_ID ?? '', 10),
  storeHash: process.env.NEXT_PUBLIC_BIGCOMMERCE_STORE_HASH,
});
