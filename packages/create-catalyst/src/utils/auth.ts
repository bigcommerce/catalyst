import { Https } from './https';
import { DeviceCodeSchema, DeviceCodeSuccessSchema, parse } from './parse';

interface AuthConfig {
  baseUrl: string;
}

export class Auth {
  private client: Https;
  private readonly DEVICE_OAUTH_CLIENT_ID = 'b8063bu6hhml4e0lqh22yut63atsbyv';

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

    return parse(await response.json(), DeviceCodeSuccessSchema);
  }
}
