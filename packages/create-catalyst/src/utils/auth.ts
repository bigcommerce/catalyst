import { z } from 'zod';
import { Https } from './https';
import { parse } from './parse';

interface AuthConfig {
  baseUrl: string;
}

export class Auth {
  private client: Https;
  private readonly DEVICE_OAUTH_CLIENT_ID = 'acse0vvawm9r1n0evag4b8e1ea1fo90';

  constructor({ baseUrl }: AuthConfig) {
    this.client = new Https({ baseUrl });
  }

  async getDeviceCode() {
    const response = await this.client.fetch('/device/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scopes: [
          'store_channel_settings',
          'store_sites',
          'store_storefront_api',
          'store_v2_content',
          'store_v2_information',
          'store_v2_products',
          'store_cart',
        ].join(' '),
        client_id: this.DEVICE_OAUTH_CLIENT_ID,
      }),
    });

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
    const response = await this.client.fetch('/device/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
} 