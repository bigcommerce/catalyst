import { getCLIUserAgent } from './user-agent';

interface HttpsConfig {
  baseUrl: string;
  accessToken?: string;
}

export class Https {
  private baseUrl: string;
  private accessToken?: string;
  private userAgent: string;

  constructor({ baseUrl, accessToken }: HttpsConfig) {
    this.baseUrl = baseUrl;
    this.accessToken = accessToken;
    this.userAgent = getCLIUserAgent();
  }

  async fetch(path: string, opts: RequestInit = {}) {
    const { headers = {}, ...rest } = opts;

    const options = {
      headers: {
        ...Object.fromEntries(new Headers(headers)),
        Accept: 'application/json',
        'User-Agent': this.userAgent,
        ...(this.accessToken && { 'X-Auth-Token': this.accessToken }),
      },
      ...rest,
    };

    return fetch(`${this.baseUrl}${path}`, options);
  }
}
