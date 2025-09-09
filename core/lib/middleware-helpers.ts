import { kv } from '~/lib/kv';

// KV adapter wrapper for the existing kv instance
export const kvAdapter = {
  async get<Data>(key: string): Promise<Data | null> {
    return kv.get<Data>(key);
  },

  async mget<Data>(...keys: string[]): Promise<(Data | null)[]> {
    return kv.mget<Data>(...keys);
  },

  async set<Data>(key: string, value: Data, opts?: { ttl?: number }): Promise<Data> {
    return kv.set<Data>(key, value, opts);
  },
};