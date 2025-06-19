import { Redis } from '@upstash/redis';

import { FetchCacheAdapter, FetchCacheOptions } from '../types';

export class UpstashRedisFetchCacheAdapter implements FetchCacheAdapter {
  private redis = Redis.fromEnv();

  async get<T>(cacheKey: string): Promise<T | null> {
    try {
      const result = await this.redis.get<T>(cacheKey);
      return result;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`Upstash Redis get failed for key ${cacheKey}:`, error);
      return null;
    }
  }

  async mget<T>(...cacheKeys: string[]): Promise<Array<T | null>> {
    try {
      const result = await this.redis.mget<T[]>(cacheKeys);

      // Redis mget returns an array, but we need to handle the case where some values might be null
      return Array.isArray(result) ? result : cacheKeys.map(() => null);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`Upstash Redis mget failed for keys [${cacheKeys.join(', ')}]:`, error);
      return cacheKeys.map(() => null);
    }
  }

  async set<T>(cacheKey: string, data: T, options: FetchCacheOptions = {}): Promise<T | null> {
    try {
      // Build Redis options - support TTL but ignore tags (not supported by Redis)
      const { ttl, tags, ...redisOpts } = options;
      const redisOptions: Record<string, unknown> = { ...redisOpts };

      // Add TTL if provided (Redis EX parameter for seconds)
      if (ttl) {
        redisOptions.ex = ttl;
      }

      const response = await this.redis.set(
        cacheKey,
        data,
        Object.keys(redisOptions).length > 0 ? redisOptions : undefined,
      );

      // Redis SET returns 'OK' on success, null on failure
      return response === 'OK' ? data : null;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`Upstash Redis set failed for key ${cacheKey}:`, error);
      return null;
    }
  }
}
