import { kv } from '@vercel/kv';

import { KvAdapter, SetCommandOptions } from '../types';

export class VercelKvAdapter implements KvAdapter {
  constructor(private adapter = kv) {}

  async get<Data>(key: string) {
    return this.adapter.get<Data>(key);
  }

  async mget<Data>(...keys: string[]) {
    return this.adapter.mget<Data[]>(keys);
  }

  async set<Data, Options extends SetCommandOptions = SetCommandOptions>(
    key: string,
    value: Data,
    opts?: Options,
  ) {
    const response = await this.adapter.set(key, value, opts);

    if (response === 'OK') {
      return null;
    }

    return response;
  }
}
