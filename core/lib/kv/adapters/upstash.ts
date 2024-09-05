import { Redis } from '@upstash/redis';

import { KvAdapter, SetCommandOptions } from '../types';

import { MemoryKvAdapter } from './memory';

const memoryKv = new MemoryKvAdapter();

export class UpstashKvAdapter implements KvAdapter {
  private upstashKv = Redis.fromEnv();
  private memoryKv = memoryKv;

  async mget<Data>(...keys: string[]) {
    const memoryValues = await this.memoryKv.mget<Data>(...keys);

    return memoryValues.length ? memoryValues : this.upstashKv.mget<Data[]>(keys);
  }

  async set<Data>(key: string, value: Data, opts?: SetCommandOptions) {
    await this.memoryKv.set(key, value, opts);

    const response = await this.upstashKv.set(key, value, opts);

    if (response === 'OK') {
      return null;
    }

    return response;
  }
}
