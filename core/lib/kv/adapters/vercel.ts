import { kv } from '@vercel/kv';

import { KvAdapter, SetCommandOptions } from '../types';

import { MemoryKvAdapter } from './memory';

const memoryKv = new MemoryKvAdapter();

export class VercelKvAdapter implements KvAdapter {
  private vercelKv = kv;
  private memoryKv = memoryKv;

  async mget<Data>(...keys: string[]) {
    const memoryValues = await this.memoryKv.mget<Data>(...keys);

    return memoryValues.length ? memoryValues : this.vercelKv.mget<Data[]>(keys);
  }

  async set<Data>(key: string, value: Data, opts?: SetCommandOptions) {
    await this.memoryKv.set(key, value, opts);

    const response = await this.vercelKv.set(key, value, opts);

    if (response === 'OK') {
      return null;
    }

    return response;
  }
}
