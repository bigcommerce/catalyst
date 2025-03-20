import { createClient } from 'redis';

import { KvAdapter, SetCommandOptions } from '../types';

import { MemoryKvAdapter } from './memory';

const memoryKv = new MemoryKvAdapter();

export class RedisKvAdapter implements KvAdapter {
  private redisClient = createClient({
    url: process.env.REDIS_URL,
  });
  private memoryKv = memoryKv;

  constructor() {
    if (!process.env.REDIS_URL) {
      throw new Error('REDIS_URL is not set');
    }

    void this.connect();
  }

  async mget<Data>(...keys: string[]) {
    const memoryValues = await this.memoryKv.mget<Data>(...keys);

    if (memoryValues.length > 0 && memoryValues.every((v) => v !== null)) {
      return memoryValues;
    }

    await this.connect();

    const values = await this.redisClient.mGet(keys);

    // Parse values, returning null for nulls or parsing errors
    return values.map((value: string | null) => {
      if (value === null) {
        return null;
      }

      try {
        // Assuming the stored data matches the expected type `Data`.
        // A more robust solution might involve schema validation.
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        return JSON.parse(value) as Data;
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(`Failed to parse Redis value for key (omitted):`, e);

        return null; // Return null if parsing fails
      }
    });
  }

  async set<Data>(key: string, value: Data, opts?: SetCommandOptions) {
    await this.memoryKv.set(key, value, opts);

    const serializedValue = JSON.stringify(value);
    const options: { EX?: number } = {};

    if (typeof opts?.ex === 'number') {
      options.EX = opts.ex;
    }

    await this.connect();
    await this.redisClient.set(key, serializedValue, options);

    return value;
  }

  private async connect() {
    if (!this.redisClient.isOpen) {
      await this.redisClient.connect();
    }
  }
}
