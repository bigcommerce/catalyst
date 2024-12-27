import type { BigCommerceService } from '../types';
import {
  type Channel,
  type ChannelsResponse,
  type CreateChannelResponse,
  type EligibilityResponse,
  Https,
  type InitResponse,
} from '../utils/https';

export interface BigCommerceConfig {
  bigCommerceApiUrl: string;
  bigCommerceAuthUrl: string;
  cliApiUrl: string;
}

export interface BigCommerceCredentials {
  storeHash: string;
  accessToken: string;
}

export class BigCommerceServiceImpl implements BigCommerceService {
  private https: Https | null = null;
  private readonly config: BigCommerceConfig;

  constructor(config: BigCommerceConfig) {
    this.config = config;
  }

  async getChannels(): Promise<Channel[]> {
    if (!this.https) throw new Error('HTTPS client not initialized');

    const response = await this.https.get<ChannelsResponse>(
      '/channels?available=true&type=storefront',
    );

    return response.data;
  }

  async createChannel(name: string): Promise<CreateChannelResponse['data']> {
    if (!this.https) throw new Error('HTTPS client not initialized');

    const response = await this.https.post<CreateChannelResponse>('/channels/catalyst', {
      name,
      initialData: { type: 'sample', scenario: 1 },
      deployStorefront: false,
    });

    return response.data;
  }

  async checkEligibility(): Promise<EligibilityResponse['data']> {
    if (!this.https) throw new Error('HTTPS client not initialized');

    const response = await this.https.get<EligibilityResponse>('/channels/catalyst/eligibility');

    return response.data;
  }

  async getChannelInit(
    credentials: BigCommerceCredentials,
    channelId: number,
  ): Promise<InitResponse['data']> {
    this.initializeHttps(credentials);
    if (!this.https) throw new Error('HTTPS client not initialized');

    const response = await this.https.get<InitResponse>(`/channels/${channelId}/init`);

    return response.data;
  }

  async login(authUrl: string): Promise<{ storeHash: string; accessToken: string }> {
    const auth = new Https({ bigCommerceApiUrl: authUrl });
    const deviceCode = await auth.getDeviceCode();
    const { store_hash, access_token } = await auth.checkDeviceCode(deviceCode.device_code);

    return { storeHash: store_hash, accessToken: access_token };
  }

  updateCredentials(storeHash: string, accessToken: string): void {
    this.initializeHttps({ storeHash, accessToken });
  }

  private initializeHttps(credentials: BigCommerceCredentials) {
    this.https = new Https({
      bigCommerceApiUrl: `${this.config.cliApiUrl}/stores/${credentials.storeHash}/cli-api/v3`,
      storeHash: credentials.storeHash,
      accessToken: credentials.accessToken,
    });
  }
}
