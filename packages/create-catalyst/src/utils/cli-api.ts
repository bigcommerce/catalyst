import { Https } from './https';

interface CliApiConfig {
  origin: string;
  storeHash: string;
  accessToken: string;
}

export class CliApi {
  private client: Https;

  constructor({ origin, storeHash, accessToken }: CliApiConfig) {
    this.client = new Https({
      baseUrl: `${origin}/stores/${storeHash}/cli-api/v3`,
      accessToken,
    });
  }

  async getChannelInit(channelId: number | string) {
    return this.client.fetch(`/channels/${channelId}/init`, {
      method: 'GET',
    });
  }

  async checkEligibility() {
    return this.client.fetch('/channels/catalyst/eligibility', {
      method: 'GET',
    });
  }

  async createChannel(name: string, installSampleData = false) {
    return this.client.fetch('/channels/catalyst', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        initialData: {
          type: installSampleData ? 'sample' : 'none',
        },
        deployStorefront: true,
        devOrigin: 'http://localhost:3000',
      }),
    });
  }
}
