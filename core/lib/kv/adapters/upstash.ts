import { Redis } from '@upstash/redis';

import { KvAdapter, SetCommandOptions } from '../types';

export class UpstashKvAdapter implements KvAdapter {
  private upstashKv = Redis.fromEnv();

  async mget<Data>(...keys: string[]) {
    return this.upstashKv.mget<Data[]>(keys);
  }

  async set<Data>(key: string, value: Data, opts?: SetCommandOptions) {
    const response = await this.upstashKv.set(key, value, opts);

    if (response === 'OK') {
      return null;
    }

    return response;
  }
}
