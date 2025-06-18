import { KvAdapter, SetCommandOptions } from '../types';

import { MemoryKvAdapter } from './memory';

const memoryKv = new MemoryKvAdapter();

// Performance timing utility with feature detection
const getPerformanceNow = (): (() => number) => {
  if (typeof performance !== 'undefined' && performance.now) {
    return () => performance.now();
  }
  return () => Date.now();
};

const now = getPerformanceNow();

export class RuntimeCacheAdapter implements KvAdapter {
  private memoryKv = memoryKv;
  private loggingEnabled = 
    (process.env.NODE_ENV !== 'production' && process.env.KV_LOGGER !== 'false') ||
    process.env.KV_LOGGER === 'true';

  private logger(message: string) {
    if (this.loggingEnabled) {
      // eslint-disable-next-line no-console
      console.log(`[Vercel Runtime Cache] ${message}`);
    }
  }

  async mget<Data>(...keys: string[]) {
    const startTime = now();
    
    // First check memory cache for immediate reads
    const memoryStartTime = now();
    const memoryValues = await this.memoryKv.mget<Data>(...keys);
    const memoryTime = now() - memoryStartTime;

    // Check which keys were found in memory
    const memoryHits = memoryValues.filter((value) => value !== null).length;
    const memoryMisses = keys.length - memoryHits;

    // If all values are found in memory, return them
    if (memoryValues.every((value) => value !== null)) {
      const totalTime = now() - startTime;
      this.logger(
        `MGET - Keys: ${keys.join(', ')} - All found in MEMORY CACHE - ` +
        `Memory: ${memoryTime.toFixed(2)}ms, Total: ${totalTime.toFixed(2)}ms`
      );
      return memoryValues;
    }

    this.logger(
      `MGET - Keys: ${keys.join(', ')} - Memory hits: ${memoryHits}, Memory misses: ${memoryMisses} - ` +
      `Memory lookup: ${memoryTime.toFixed(2)}ms`
    );

    // Otherwise, fetch from runtime cache
    const runtimeStartTime = now();
    const { getCache } = await import('@vercel/functions');
    const cache = getCache();

    const values = await Promise.all(
      keys.map(async (key, index) => {
        // If we already have this value from memory, use it
        const memoryValue = memoryValues[index];
        if (memoryValue !== null && memoryValue !== undefined) {
          return memoryValue;
        }

        try {
          return await cache.get(key) as Data | null;
        } catch (error) {
          // eslint-disable-next-line no-console
          console.warn(`Runtime cache get failed for key ${key}:`, error);
          return null;
        }
      })
    );

    const runtimeTime = now() - runtimeStartTime;
    const runtimeHits = values.filter((value, index) => {
      const memoryValue = memoryValues[index];
      return (memoryValue === null || memoryValue === undefined) && value !== null;
    }).length;
    const totalMisses = values.filter((value) => value === null || value === undefined).length;

    // Store the values in memory cache for future reads
    await Promise.all(
      values.map(async (value, index) => {
        const key = keys[index];
        const memoryValue = memoryValues[index];

        if (!key || value === null || value === undefined || (memoryValue !== null && memoryValue !== undefined)) {
          return;
        }

        await this.memoryKv.set(key, value);
      }),
    );

    const totalTime = now() - startTime;
    this.logger(
      `MGET - Keys: ${keys.join(', ')} - Memory hits: ${memoryHits}, Runtime hits: ${runtimeHits}, Total misses: ${totalMisses} - ` +
      `Memory: ${memoryTime.toFixed(2)}ms, Runtime: ${runtimeTime.toFixed(2)}ms, Total: ${totalTime.toFixed(2)}ms`
    );

    return values;
  }

  async set<Data>(key: string, value: Data, opts?: SetCommandOptions) {
    const startTime = now();
    
    // Convert options for memory cache (it only supports TTL as 'ex' field)
    const memoryStartTime = now();
    const memoryOpts = opts?.ttl ? { ex: opts.ttl } : undefined;
    await this.memoryKv.set(key, value, memoryOpts);
    const memoryTime = now() - memoryStartTime;

    // Set in runtime cache for persistence
    const runtimeStartTime = now();
    let runtimeSuccess = false;
    try {
      const { getCache } = await import('@vercel/functions');
      const cache = getCache();
      
      // Build runtime cache options from our options
      const runtimeCacheOptions: Record<string, unknown> = {};
      
      if (opts?.ttl) {
        runtimeCacheOptions.ttl = opts.ttl;
      }
      
      if (opts?.tags && Array.isArray(opts.tags)) {
        runtimeCacheOptions.tags = opts.tags;
      }
      
      // Call cache.set with options if provided, otherwise call without options
      if (Object.keys(runtimeCacheOptions).length > 0) {
        await cache.set(key, value, runtimeCacheOptions);
      } else {
        await cache.set(key, value);
      }
      runtimeSuccess = true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`Runtime cache set failed for key ${key}:`, error);
    }
    const runtimeTime = now() - runtimeStartTime;
    const totalTime = now() - startTime;

    // Build options summary for logging
    const optsSummary = [];
    if (opts?.ttl) optsSummary.push(`TTL: ${opts.ttl}s`);
    if (opts?.tags?.length) optsSummary.push(`Tags: [${opts.tags.join(', ')}]`);
    const optsStr = optsSummary.length > 0 ? ` - Options: ${optsSummary.join(', ')}` : '';

    this.logger(
      `SET - Key: ${key} - Memory: ✓ (${memoryTime.toFixed(2)}ms), Runtime: ${runtimeSuccess ? '✓' : '✗'} (${runtimeTime.toFixed(2)}ms), Total: ${totalTime.toFixed(2)}ms${optsStr}`
    );

    return value;
  }
} 