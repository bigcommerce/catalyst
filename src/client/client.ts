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

    this.apiUrl = this.getApiUrl();
    this.storefrontApiUrl = this.getStorefrontApiUrl();
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

  async query<ResponseType>(
    query: string,
    variables: Record<string, unknown> = {},
  ): Promise<ResponseType> {
    const {
      data: { token },
    } = await this.fetchStorefrontToken();

    const response = await fetch(this.storefrontApiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return (await response.json()) as ResponseType;
  }

  private getApiUrl() {
    return `${this.config.apiUrl}/stores/${this.config.storeHash}`;
  }

  private getStorefrontApiUrl() {
    const channelIdSegment = this.config.channelId !== 1 ? `-${this.config.channelId}` : '';

    return `https://store-${this.config.storeHash}${channelIdSegment}.${this.config.canonicalDomainName}/graphql`;
  }

  private async fetchStorefrontToken() {
    const response = await this.fetch(`/v3/storefront/api-token-customer-impersonation`, {
      method: 'POST',
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
  apiUrl: process.env.NEXT_PUBLIC_BIGCOMMERCE_API_URL,
  canonicalDomainName: process.env.NEXT_PUBLIC_BIGCOMMERCE_CANONICAL_STORE_DOMAIN,
});
