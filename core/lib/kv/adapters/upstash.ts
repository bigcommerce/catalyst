import { Redis } from '@upstash/redis';

import { KvAdapter, SetCommandOptions } from '../types';

import { MemoryKvAdapter } from './memory';

const memoryKv = new MemoryKvAdapter();

export class UpstashKvAdapter implements KvAdapter {
  private upstashKv = Redis.fromEnv();
  private memoryKv = memoryKv;

  async mget<Data>(...keys: string[]) {
    const memoryValues = await this.memoryKv.mget<Data>(...keys);

    return memoryValues.length ? memoryValues : this.upstashKv.mget<Data[]>(keys);
  }

  async set<Data>(key: string, value: Data, opts?: SetCommandOptions) {
    // Convert options for memory cache (it only supports TTL as 'ex' field)
    const memoryOpts = opts?.ttl ? { ex: opts.ttl } : undefined;
    await this.memoryKv.set(key, value, memoryOpts);

    // Build Upstash Redis options - support TTL but ignore tags (not supported by Redis)
    const { ttl, tags, ...upstashOpts } = opts || {};
    const redisOpts: Record<string, unknown> = { ...upstashOpts };
    
    // Add TTL if provided (Redis EX parameter for seconds)
    if (ttl) {
      redisOpts.ex = ttl;
    }

    const response = await this.upstashKv.set(
      key, 
      value, 
      Object.keys(redisOpts).length > 0 ? redisOpts : undefined
    );

    if (response === 'OK') {
      return null;
    }

    return response;
  }
}
