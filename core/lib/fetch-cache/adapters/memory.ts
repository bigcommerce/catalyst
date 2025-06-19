/* eslint-disable @typescript-eslint/require-await */
import { LRUCache } from 'lru-cache';

import { FetchCacheAdapter, FetchCacheOptions } from '../types';

interface CacheEntry {
  value: unknown;
  expiresAt: number;
}

export class MemoryFetchCacheAdapter implements FetchCacheAdapter {
  private cache = new LRUCache<string, CacheEntry>({
    max: 500,
  });

  async get<T>(cacheKey: string): Promise<T | null> {
    const entry = this.cache.get(cacheKey);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (entry.expiresAt < Date.now()) {
      this.cache.delete(cacheKey); // Clean up expired entry
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return entry.value as T;
  }

  async mget<T>(...cacheKeys: string[]): Promise<Array<T | null>> {
    const results = cacheKeys.map((key) => {
      const entry = this.cache.get(key);

      if (!entry) {
        return null;
      }

      // Check if expired
      if (entry.expiresAt < Date.now()) {
        this.cache.delete(key); // Clean up expired entry
        return null;
      }

      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return entry.value as T;
    });

    return results;
  }

  async set<T>(cacheKey: string, data: T, options: FetchCacheOptions = {}): Promise<T | null> {
    this.cache.set(cacheKey, {
      value: data,
      expiresAt: options.ttl ? Date.now() + options.ttl * 1_000 : Number.MAX_SAFE_INTEGER,
    });

    return data;
  }
}
