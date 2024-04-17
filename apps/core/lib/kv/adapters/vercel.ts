import { kv } from '@vercel/kv';

import { KvAdapter, SetCommandOptions } from '../types';

import { DevKvAdapter } from './dev';

const memoryKv = new DevKvAdapter();

export class VercelKvAdapter implements KvAdapter {
  constructor(private adapter = kv) {}

  async get<Data>(key: string) {
    const memoryValue = await memoryKv.get<Data>(key);

    if (memoryValue) {
      // eslint-disable-next-line no-console
      console.log('======= Memory Value =======');

      return memoryValue;
    }

    return this.adapter.get<Data>(key);
  }

  async mget<Data>(...keys: string[]) {
    const memoryValues = await memoryKv.mget<Data>(...keys);

    if (memoryValues.length) {
      // eslint-disable-next-line no-console
      console.log('======= Memory Values =======');

      return memoryValues;
    }

    return this.adapter.mget<Data[]>(keys);
  }

  async set<Data, Options extends SetCommandOptions = SetCommandOptions>(
    key: string,
    value: Data,
    opts?: Options,
  ) {
    await memoryKv.set(key, value, opts);

    const response = await this.adapter.set(key, value, opts);

    if (response === 'OK') {
      return null;
    }

    return response;
  }
}
