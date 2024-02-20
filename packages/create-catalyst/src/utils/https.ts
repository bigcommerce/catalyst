/* eslint-disable @typescript-eslint/unified-signatures */

import chalk from 'chalk';
import { z } from 'zod';

import { parse } from './parse';

interface BigCommerceRestApiConfig {
  bigCommerceApiUrl: string;
  storeHash: string;
  accessToken: string;
}

interface SampleDataApiConfig {
  sampleDataApiUrl: string;
  storeHash: string;
  accessToken: string;
}

interface DeviceOAuthConfig {
  bigCommerceAuthUrl: string;
}

interface HttpsConfig {
  bigCommerceApiUrl?: string;
  bigCommerceAuthUrl?: string;
  sampleDataApiUrl?: string;
  storeHash?: string;
  accessToken?: string;
}

const BigCommerceStoreInfo = z.object({
  features: z.object({
    storefront_limits: z.object({
      active: z.number(),
      total_including_inactive: z.number(),
    }),
  }),
});

export type BigCommerceStoreInfo = z.infer<typeof BigCommerceStoreInfo>;

const BigCommerceV3ApiResponseSchema = <T>(schema: z.ZodType<T>) =>
  z.object({
    data: schema,
    meta: z.object({}),
  });

const BigCommerceChannelsV3ResponseSchema = BigCommerceV3ApiResponseSchema(
  z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      status: z.string(),
      platform: z.string(),
    }),
  ),
);

export type BigCommerceChannelsV3Response = z.infer<typeof BigCommerceChannelsV3ResponseSchema>;

export class Https {
  DEVICE_OAUTH_CLIENT_ID = 'acse0vvawm9r1n0evag4b8e1ea1fo90';

  bigCommerceApiUrl: string;
  bigCommerceAuthUrl: string;
  sampleDataApiUrl: string;
  storeHash: string;
  accessToken: string;

  constructor({ bigCommerceApiUrl, storeHash, accessToken }: BigCommerceRestApiConfig);
  constructor({ sampleDataApiUrl, storeHash, accessToken }: SampleDataApiConfig);
  constructor({ bigCommerceAuthUrl }: DeviceOAuthConfig);
  constructor({
    bigCommerceApiUrl,
    bigCommerceAuthUrl,
    sampleDataApiUrl,
    storeHash,
    accessToken,
  }: HttpsConfig) {
    this.bigCommerceApiUrl = bigCommerceApiUrl || '';
    this.bigCommerceAuthUrl = bigCommerceAuthUrl || '';
    this.sampleDataApiUrl = sampleDataApiUrl || '';
    this.storeHash = storeHash || '';
    this.accessToken = accessToken || '';
  }

  auth(path: string, opts: RequestInit = {}) {
    if (!this.bigCommerceAuthUrl) {
      throw new Error('bigCommerceAuthUrl is required to make API requests');
    }

    const { headers = {}, ...rest } = opts;

    const options = {
      method: 'POST',
      headers: {
        ...headers,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      ...rest,
    };

    return fetch(`${this.bigCommerceAuthUrl}${path}`, options);
  }

  async getDeviceCode() {
    const response = await this.auth('/device/token', {
      body: JSON.stringify({
        scopes: [
          'store_v2_content',
          'store_v2_information',
          'store_v2_products',
          'store_cart',
          'store_sites',
          'store_channel_settings',
          'store_storefront_api_customer_impersonation',
        ].join(' '),
        client_id: this.DEVICE_OAUTH_CLIENT_ID,
      }),
    });

    if (!response.ok) {
      console.error(
        chalk.red(`\nPOST /device/token failed: ${response.status} ${response.statusText}\n`),
      );
      process.exit(1);
    }

    const DeviceCodeSchema = z.object({
      device_code: z.string(),
      user_code: z.string(),
      verification_uri: z.string(),
      expires_in: z.number(),
      interval: z.number(),
    });

    return parse(await response.json(), DeviceCodeSchema);
  }

  async checkDeviceCode(deviceCode: string) {
    const response = await this.auth('/device/token', {
      body: JSON.stringify({
        device_code: deviceCode,
        client_id: this.DEVICE_OAUTH_CLIENT_ID,
      }),
    });

    if (response.status !== 200) {
      throw new Error('Device code not yet verified');
    }

    const DeviceCodeSuccessSchema = z.object({
      access_token: z.string(),
      store_hash: z.string(),
      context: z.string(),
      api_uri: z.string().url(),
    });

    return parse(await response.json(), DeviceCodeSuccessSchema);
  }

  api(path: string, opts: RequestInit = {}) {
    if (!this.bigCommerceApiUrl || !this.storeHash || !this.accessToken) {
      throw new Error(
        'bigCommerceApiUrl, storeHash, and accessToken are required to make API requests',
      );
    }

    const { headers = {}, ...rest } = opts;

    const options = {
      headers: {
        ...headers,
        Accept: 'application/json',
        'X-Auth-Token': this.accessToken,
      },
      ...rest,
    };

    return fetch(`${this.bigCommerceApiUrl}/stores/${this.storeHash}${path}`, options);
  }

  async storeInformation() {
    const res = await this.api('/v2/store');

    if (!res.ok) {
      console.error(chalk.red(`\nGET /v2/store failed: ${res.status} ${res.statusText}\n`));
      process.exit(1);
    }

    return parse(await res.json(), BigCommerceStoreInfo);
  }

  async channels(query = '') {
    const res = await this.api(`/v3/channels${query}`);

    if (!res.ok) {
      console.error(chalk.red(`\nGET /v3/channels failed: ${res.status} ${res.statusText}\n`));
      process.exit(1);
    }

    return parse(await res.json(), BigCommerceChannelsV3ResponseSchema);
  }

  async customerImpersonationToken(channelId: number) {
    const res = await this.api('/v3/storefront/api-token-customer-impersonation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expires_at: 2147483647, channel_id: channelId }),
    });

    if (!res.ok) {
      console.error(
        chalk.red(
          `\nPOST /v3/storefront/api-token-customer-impersonation failed: ${res.status} ${res.statusText}\n`,
        ),
      );
      process.exit(1);
    }

    const BigCommerceCustomerImpersonationTokenSchema = z.object({
      data: z.object({
        token: z.string(),
      }),
    });

    return parse(await res.json(), BigCommerceCustomerImpersonationTokenSchema);
  }

  sampleDataApi(path: string, opts: RequestInit = {}) {
    if (!this.sampleDataApiUrl || !this.storeHash || !this.accessToken) {
      throw new Error(
        'sampleDataApiUrl, storeHash, and accessToken are required to make API requests',
      );
    }

    const { headers = {}, ...rest } = opts;

    const options = {
      method: 'POST',
      headers: {
        ...headers,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Auth-Token': this.accessToken,
      },
      ...rest,
    };

    return fetch(`${this.sampleDataApiUrl}/stores/${this.storeHash}${path}`, options);
  }

  async createChannel(channelName: string) {
    const res = await this.sampleDataApi('/v3/channels/catalyst', {
      body: JSON.stringify({ name: channelName }),
    });

    if (!res.ok) {
      console.error(
        chalk.red(`\nPOST /v3/channels/catalyst failed: ${res.status} ${res.statusText}\n`),
      );
      process.exit(1);
    }

    const SampleDataChannelCreateSchema = z.object({
      data: z.object({
        id: z.number(),
        name: z.string().min(1),
        storefront_api_token: z.string(),
      }),
    });

    return parse(await res.json(), SampleDataChannelCreateSchema);
  }
}
