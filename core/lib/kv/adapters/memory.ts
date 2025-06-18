/* eslint-disable @typescript-eslint/require-await */
import { LRUCache } from 'lru-cache';

import { KvAdapter } from '../types';

interface CacheEntry {
  value: unknown;
  expiresAt: number;
}

export class MemoryKvAdapter implements KvAdapter {
  private kv = new LRUCache<string, CacheEntry>({
    max: 500,
  });

  async mget<Data>(...keys: string[]): Promise<Array<Data | null>> {
    const results = keys.map((key) => {
      const entry = this.kv.get(key);
      
      if (!entry) {
        return null;
      }
      
      // Check if expired
      if (entry.expiresAt < Date.now()) {
        this.kv.delete(key); // Clean up expired entry
        return null;
      }
      
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return entry.value as Data;
    });

    return results;
  }

  async set<Data>(key: string, value: Data, options: { ex?: number } = {}): Promise<Data | null> {
    this.kv.set(key, {
      value,
      expiresAt: options.ex ? Date.now() + options.ex * 1_000 : Number.MAX_SAFE_INTEGER,
    });

    return value;
  }
}
