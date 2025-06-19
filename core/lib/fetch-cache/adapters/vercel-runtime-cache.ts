import { FetchCacheAdapter, FetchCacheOptions } from '../types';

export class VercelRuntimeCacheAdapter implements FetchCacheAdapter {
  async get<T>(cacheKey: string): Promise<T | null> {
    try {
      const { getCache } = await import('@vercel/functions');
      const cache = getCache();
      const result = await cache.get(cacheKey);

      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return result as T | null;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`Vercel runtime cache get failed for key ${cacheKey}:`, error);
      return null;
    }
  }

  async mget<T>(...cacheKeys: string[]): Promise<Array<T | null>> {
    const { getCache } = await import('@vercel/functions');
    const cache = getCache();

    const values = await Promise.all(
      cacheKeys.map(async (key) => {
        try {
          const result = await cache.get(key);
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          return result as T | null;
        } catch (error) {
          // eslint-disable-next-line no-console
          console.warn(`Vercel runtime cache get failed for key ${key}:`, error);
          return null;
        }
      }),
    );

    return values;
  }

  async set<T>(cacheKey: string, data: T, options: FetchCacheOptions = {}): Promise<T | null> {
    try {
      const { getCache } = await import('@vercel/functions');
      const cache = getCache();

      // Build runtime cache options
      const runtimeCacheOptions: Record<string, unknown> = {};

      if (options.ttl) {
        runtimeCacheOptions.ttl = options.ttl;
      }

      if (options.tags && Array.isArray(options.tags)) {
        runtimeCacheOptions.tags = options.tags;
      }

      // Call cache.set with options if provided, otherwise call without options
      if (Object.keys(runtimeCacheOptions).length > 0) {
        await cache.set(cacheKey, data, runtimeCacheOptions);
      } else {
        await cache.set(cacheKey, data);
      }

      return data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`Vercel runtime cache set failed for key ${cacheKey}:`, error);
      return null;
    }
  }
}
