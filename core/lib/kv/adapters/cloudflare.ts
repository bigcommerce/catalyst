import { getCloudflareContext } from '@opennextjs/cloudflare';

import { KvAdapter, SetCommandOptions } from '../types';

import { MemoryKvAdapter } from './memory';

const memoryKv = new MemoryKvAdapter();

const kv = getCloudflareContext().env['catalyst-test-jm'];

export class CloudflareKvAdapter implements KvAdapter {
  private cloudflareKv = kv;
  private memoryKv = memoryKv;

  async mget<Data>(...keys: string[]) {
    const memoryValues = await this.memoryKv.mget<Data>(...keys);

    if (memoryValues.length) {
      return memoryValues;
    }

    const map = await this.cloudflareKv.getWithMetadata(keys);

    return keys.map((key) => {
      const entry = map.get(key);

      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return entry?.value != null ? (JSON.parse(entry.value) as Data) : null;
    });
  }

  async set<Data>(key: string, value: Data, opts?: SetCommandOptions) {
    await this.memoryKv.set(key, value, opts);

    // Cloudflare KV expects value to be a string, ArrayBuffer, or ReadableStream
    const storedValue = typeof value === 'string' ? value : JSON.stringify(value);

    await this.cloudflareKv.put(key, storedValue, opts);

    return value;
  }
}
