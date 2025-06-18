import { Redis } from '@upstash/redis';

import { KvAdapter, SetCommandOptions } from '../types';

export class UpstashKvAdapter implements KvAdapter {
  private redis = Redis.fromEnv();

  async mget<Data>(...keys: string[]): Promise<Array<Data | null>> {
    const result = await this.redis.mget<Data[]>(keys);
    
    // Redis mget returns an array, but we need to handle the case where some values might be null
    return Array.isArray(result) ? result : keys.map(() => null);
  }

  async set<Data>(key: string, value: Data, opts?: SetCommandOptions): Promise<Data | null> {
    // Build Redis options - support TTL but ignore tags (not supported by Redis)
    const { ttl, tags, ...redisOpts } = opts || {};
    const options: Record<string, unknown> = { ...redisOpts };

    // Add TTL if provided (Redis EX parameter for seconds)
    if (ttl) {
      options.ex = ttl;
    }

    const response = await this.redis.set(
      key,
      value,
      Object.keys(options).length > 0 ? options : undefined,
    );

    // Redis SET returns 'OK' on success, null on failure
    return response === 'OK' ? value : null;
  }
}
