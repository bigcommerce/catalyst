/* eslint-disable @typescript-eslint/require-await */
import { KvAdapter } from '../types';

interface CacheEntry {
  value: unknown;
  expiresAt: number;
}

export class DevKvAdapter implements KvAdapter {
  private kv = new Map<string, CacheEntry>();

  constructor() {
    // eslint-disable-next-line no-console
    console.log(`
[BigCommerce] --------------------------------
[BigCommerce] KV WARNING: Using DevKvAdapter.
[BigCommerce] This KV adapter does not persist data.
[BigCommerce] --------------------------------
`);
  }

  async get<Data>(key: string) {
    const entry = this.kv.get(key);

    if (!entry) {
      return null;
    }

    if (entry.expiresAt < Date.now()) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return entry.value as Data;
  }

  async mget<Data>(...keys: string[]) {
    const entries = keys.map((key) => this.kv.get(key)?.value);

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return entries as Data[];
  }

  async set<Data>(key: string, value: Data, options: { ex?: number } = {}) {
    this.kv.set(key, {
      value,
      expiresAt: options.ex ? Date.now() + options.ex * 1_000 : Number.MAX_SAFE_INTEGER,
    });

    return value;
  }
}
