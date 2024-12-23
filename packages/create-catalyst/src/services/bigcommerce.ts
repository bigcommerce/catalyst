import { input, select } from '@inquirer/prompts';
import { z } from 'zod';
import { BigCommerceService } from '../types';
import { Https } from '../utils/https';

export interface BigCommerceConfig {
  bigCommerceApiUrl: string;
  bigCommerceAuthUrl: string;
  sampleDataApiUrl: string;
  storeHash?: string;
  accessToken?: string;
}

export class BigCommerceServiceImpl implements BigCommerceService {
  private https!: Https;
  private sampleDataApi!: Https;
  private config: BigCommerceConfig;

  constructor(config: BigCommerceConfig) {
    this.config = {
      bigCommerceApiUrl: config.bigCommerceApiUrl,
      bigCommerceAuthUrl: config.bigCommerceAuthUrl,
      sampleDataApiUrl: config.sampleDataApiUrl,
      storeHash: config.storeHash,
      accessToken: config.accessToken,
    };
    this.initializeHttps();
  }

  updateCredentials(storeHash: string, accessToken: string): void {
    this.config = {
      ...this.config,
      storeHash,
      accessToken,
    };
    this.initializeHttps();
  }

  async login(authUrl: string): Promise<{ storeHash: string; accessToken: string }> {
    const shouldLogin = await select({
      message: 'Would you like to connect to a BigCommerce store?',
      choices: [
        { name: 'Yes', value: true },
        { name: 'No', value: false },
      ],
    });

    if (!shouldLogin) {
      return { storeHash: '', accessToken: '' };
    }

    const auth = new Https({ bigCommerceAuthUrl: authUrl });
    const deviceCode = await auth.getDeviceCode();

    console.log(
      `\nPlease visit ${deviceCode.verification_uri} and enter the code: ${deviceCode.user_code}\n`,
      `The code will expire in ${deviceCode.expires_in / 60} minutes\n`,
    );

    const response = await this.pollDeviceCode(auth, deviceCode);

    return {
      storeHash: response.store_hash,
      accessToken: response.access_token,
    };
  }

  async createChannel(name: string): Promise<{ id: number; token: string }> {
    if (!this.config.storeHash || !this.config.accessToken) {
      throw new Error('Store credentials are required to create a channel');
    }

    const response = await this.sampleDataApi.createChannel(name);
    await this.https.createChannelMenus(response.data.id);

    return {
      id: response.data.id,
      token: response.data.storefront_api_token,
    };
  }

  async getChannels(): Promise<Array<{ id: number; name: string; platform: string }>> {
    if (!this.config.storeHash || !this.config.accessToken) {
      throw new Error('Store credentials are required to get channels');
    }

    const response = await this.https.channels('?available=true&type=storefront');
    const channelSortOrder = ['catalyst', 'next', 'bigcommerce'];

    return response.data
      .sort((a, b) => channelSortOrder.indexOf(a.platform) - channelSortOrder.indexOf(b.platform))
      .map(channel => ({
        id: channel.id,
        name: channel.name,
        platform: channel.platform,
      }));
  }

  async checkEligibility(): Promise<{ eligible: boolean; message: string }> {
    if (!this.config.storeHash || !this.config.accessToken) {
      throw new Error('Store credentials are required to check eligibility');
    }

    const response = await this.sampleDataApi.checkEligibility();
    return response.data;
  }

  private async pollDeviceCode(
    auth: Https,
    deviceCode: { device_code: string; interval: number; expires_in: number },
  ) {
    const intervalMs = deviceCode.interval * 1000;
    const expiresAtMs = deviceCode.expires_in * 1000;
    const retries = expiresAtMs / intervalMs;

    for (let i = 0; i < retries; i += 1) {
      try {
        return await auth.checkDeviceCode(deviceCode.device_code);
      } catch {
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
    }

    throw new Error('Device code expired. Please try again.');
  }

  private initializeHttps(): void {
    if (this.config.storeHash && this.config.accessToken) {
      // Create a new instance for the main API
      this.https = new Https({
        bigCommerceApiUrl: this.config.bigCommerceApiUrl,
        storeHash: this.config.storeHash,
        accessToken: this.config.accessToken,
      });

      // Create a new instance for the sample data API
      this.sampleDataApi = new Https({
        sampleDataApiUrl: this.config.sampleDataApiUrl,
        storeHash: this.config.storeHash,
        accessToken: this.config.accessToken,
      });
    } else {
      // Initialize with minimal config when no credentials are available
      this.https = new Https({
        bigCommerceAuthUrl: this.config.bigCommerceAuthUrl,
      });
      this.sampleDataApi = new Https({
        bigCommerceAuthUrl: this.config.bigCommerceAuthUrl,
      });
    }
  }
} 