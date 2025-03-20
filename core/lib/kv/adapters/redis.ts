import { createClient } from 'redis';

import { KvAdapter, SetCommandOptions } from '../types';

import { MemoryKvAdapter } from './memory';

const memoryKv = new MemoryKvAdapter();

export class RedisKvAdapter implements KvAdapter {
  private redisClient = createClient({
    url: process.env.ROUTE_CACHE_REDIS_URL,
  });
  private memoryKv = memoryKv;

  constructor() {
    if (!process.env.ROUTE_CACHE_REDIS_URL) {
      throw new Error('ROUTE_CACHE_REDIS_URL is not set');
    }

    this.connect();
  }

  private async connect() {
    if (!this.redisClient.isOpen) {
      await this.redisClient.connect();
    }
  }

  async mget<Data>(...keys: string[]) {
    const memoryValues = await this.memoryKv.mget<Data>(...keys);

    if (memoryValues.length) {
      return memoryValues;
    }

    await this.connect();
    const values = await this.redisClient.mGet(keys);

    return values.map((value: string | null) => (value ? JSON.parse(value) : null)) as Data[];
  }

  async set<Data>(key: string, value: Data, opts?: SetCommandOptions) {
    await this.memoryKv.set(key, value, opts);

    const serializedValue = JSON.stringify(value);
    const options: { EX?: number } = {};

    if (opts?.ex) {
      options.EX = opts.ex as number;
    }

    await this.connect();
    await this.redisClient.set(key, serializedValue, options);

    return value;
  }
} 