import { get } from '@vercel/edge-config';

import { KvAdapter } from '../types';

export class VercelEdgeConfigAdapter implements KvAdapter {
  private config_id = '';

  constructor() {
    const config_matcher = /(?:https:\/\/edge-config.vercel.com\/)(.*)\?(?:.*)/;

    if (
      !process.env.EDGE_CONFIG ||
      !process.env.VERCEL_TEAM_ID ||
      !process.env.VERCEL_ACCESS_TOKEN
    ) {
      // eslint-disable-next-line no-console
      console.error(
        `EDGE_CONFIG, VERCEL_TEAM_ID, and VERCEL_ACCESS_TOKEN must be defined to use the Edge Config adapter`,
      );

      return;
    }

    const match = config_matcher.exec(process.env.EDGE_CONFIG);

    if (!match || !match[1]) {
      // eslint-disable-next-line no-console
      console.error(`EDGE_CONFIG is malformed, unable to initialize Edge Config adapter`);

      return;
    }

    this.config_id = match[1];
  }

  async get<Data>(key: string) {
    const keyHash = await this.hashString(key);

    return get<string>(keyHash).then(
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      (result) => (result !== undefined ? (JSON.parse(result) as Data) : null),
    );
  }

  async mget<Data>(...keys: string[]) {
    return Promise.all(keys.map((key) => this.get<Data>(key)));
  }

  async set<Data>(key: string, value: Data) {
    const keyHash = await this.hashString(key);

    const url = `https://api.vercel.com/v1/edge-config/${this.config_id}/items?teamId=${process.env.VERCEL_TEAM_ID ?? ''}`;

    void fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_ACCESS_TOKEN ?? ''}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [
          {
            operation: 'upsert',
            key: keyHash,
            value: JSON.stringify(value),
          },
        ],
      }),
    });

    return value;
  }

  private async hashString(key: string) {
    return crypto.subtle.digest('SHA-1', new TextEncoder().encode(key)).then((buf) => {
      return Array.prototype.map
        .call(new Uint8Array(buf), (x: string) => `00${parseInt(x, 10).toString(16)}`.slice(-2))
        .join('');
    });
  }
}
