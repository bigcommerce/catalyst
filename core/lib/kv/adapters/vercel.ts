import { kv } from '@vercel/kv';

import { KvAdapter, SetCommandOptions } from '../types';

import { MemoryKvAdapter } from './memory';

const memoryKv = new MemoryKvAdapter();

export class VercelKvAdapter implements KvAdapter {
  private vercelKv = kv;
  private memoryKv = memoryKv;

  async get<Data>(key: string) {
    const memoryValue = await this.memoryKv.get<Data>(key);

    return memoryValue ?? this.vercelKv.get<Data>(key);
  }

  async mget<Data>(...keys: string[]) {
    const memoryValues = await this.memoryKv.mget<Data>(...keys);

    return memoryValues.length ? memoryValues : this.vercelKv.mget<Data[]>(keys);
  }

  async set<Data, Options extends SetCommandOptions = SetCommandOptions>(
    key: string,
    value: Data,
    opts?: Options,
  ) {
    await this.memoryKv.set(key, value, opts);

    const response = await this.vercelKv.set(key, value, opts);

    if (response === 'OK') {
      return null;
    }

    return response;
  }
}
