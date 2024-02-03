import { kv } from '@vercel/kv';

import { KvAdapter } from '../types';

export class VercelKvAdapter implements KvAdapter {
  constructor(private adapter = kv) {}

  async get<Data>(key: string) {
    return this.adapter.get<Data>(key);
  }

  async mget<Data>(...keys: string[]) {
    return this.adapter.mget<Data[]>(keys);
  }

  async set<Data>(key: string, value: Data) {
    const response = await this.adapter.set(key, value);

    if (response === 'OK') {
      return null;
    }

    return response;
  }
}
