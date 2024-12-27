interface Channel {
  id: number;
  name: string;
  platform: 'catalyst' | 'next' | 'bigcommerce';
  type: 'storefront';
  storefront_api_token: string;
}

interface EligibilityResponse {
  data: {
    eligible: boolean;
    total_channels: number;
    active_channels: number;
    channel_limit: number;
    active_channel_limit: number;
    message: string;
  };
}

interface CreateChannelResponse {
  data: {
    id: number;
    name: string;
    platform: 'catalyst';
    type: 'storefront';
    storefront_api_token: string;
    site: {
      url: string;
    };
    deployment?: {
      id: string;
      url: string;
      created_at: string;
    };
    makeswift_api_key?: string;
    envVars?: {
      BIGCOMMERCE_STORE_HASH: string;
      BIGCOMMERCE_CUSTOMER_IMPERSONATION_TOKEN: string;
      BIGCOMMERCE_STOREFRONT_TOKEN: string;
      BIGCOMMERCE_CHANNEL_ID: string;
      MAKESWIFT_SITE_API_KEY: string;
      TRAILING_SLASH: string;
    };
  };
}

interface InitResponse {
  data: {
    makeswift_dev_api_key: string;
  };
}

interface ChannelsResponse {
  data: Channel[];
}

interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
}

interface DeviceTokenResponse {
  store_hash: string;
  access_token: string;
}

export class Https {
  constructor(
    private readonly config: {
      bigCommerceApiUrl: string;
      storeHash?: string;
      accessToken?: string;
    },
  ) {}

  async get<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'GET' });
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async getDeviceCode(): Promise<DeviceCodeResponse> {
    return this.post<DeviceCodeResponse>('/oauth/device', {});
  }

  async checkDeviceCode(deviceCode: string): Promise<DeviceTokenResponse> {
    return this.post<DeviceTokenResponse>('/oauth/device/token', { device_code: deviceCode });
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers = {
      'Content-Type': 'application/json',
      ...(this.config.accessToken ? { 'X-Auth-Token': this.config.accessToken } : {}),
      ...(options.headers ? Object.fromEntries(Object.entries(options.headers)) : {}),
    };

    const response = await fetch(`${this.config.bigCommerceApiUrl}${path}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: unknown = await response.json();

    if (!this.isValidResponse(data)) {
      throw new Error('Invalid response data');
    }

    // We need to trust that the caller knows the shape of T
    // This is a common pattern in TypeScript when dealing with JSON responses
    // where the exact shape is known by the caller but not by the generic function
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return data as T;
  }

  private isValidResponse(data: unknown): data is Record<string, unknown> {
    return data !== null && typeof data === 'object';
  }
}

export type {
  Channel,
  EligibilityResponse,
  CreateChannelResponse,
  ChannelsResponse,
  InitResponse,
  DeviceCodeResponse,
  DeviceTokenResponse,
};
