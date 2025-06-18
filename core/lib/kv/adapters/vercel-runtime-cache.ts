import { KvAdapter, SetCommandOptions } from '../types';

export class RuntimeCacheAdapter implements KvAdapter {
  async mget<Data>(...keys: string[]): Promise<Array<Data | null>> {
    const { getCache } = await import('@vercel/functions');
    const cache = getCache();

    const values = await Promise.all(
      keys.map(async (key) => {
        try {
          const result = await cache.get(key);
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          return result as Data | null;
        } catch (error) {
          // eslint-disable-next-line no-console
          console.warn(`Runtime cache get failed for key ${key}:`, error);
          return null;
        }
      }),
    );

    return values;
  }

  async set<Data>(key: string, value: Data, opts?: SetCommandOptions): Promise<Data | null> {
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

      return value;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`Runtime cache set failed for key ${key}:`, error);
      return null;
    }
  }
}
