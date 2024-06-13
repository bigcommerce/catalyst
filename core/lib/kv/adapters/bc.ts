/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { KvAdapter } from '../types';

import { MemoryKvAdapter } from './memory';

class Kv {
  private endpoint: string;
  private apiKey: string;

  constructor() {
    if (!process.env.BC_KV_REST_API_URL) {
      throw new Error('BC_KV_REST_API_URL is not set');
    }

    if (!process.env.BC_KV_REST_API_TOKEN) {
      throw new Error('BC_KV_REST_API_TOKEN is not set');
    }

    this.endpoint = process.env.BC_KV_REST_API_URL;
    this.apiKey = process.env.BC_KV_REST_API_TOKEN;
  }

  async get<T>(key: string): Promise<T | null> {
    const [value] = await this.mget<[T]>([key]);

    return value;
  }

  async mget<T extends unknown[]>(keys: string[]): Promise<{ [K in keyof T]: T[K] | null }> {
    const normalizedKeys = Array.isArray(keys) ? keys : [keys];

    const url = new URL(this.endpoint);

    normalizedKeys.forEach((key) => url.searchParams.append('key', key));

    const response = await fetch(url, {
      headers: { 'x-api-key': this.apiKey },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch keys: ${response.statusText}`);
    }

    const { data } = (await response.json()) as { data: Array<{ key: string; value: unknown }> };

    return data.map(({ value }) => value) as { [K in keyof T]: T[K] | null };
  }

  async set(key: string, value: unknown, ttlMs?: number): Promise<void> {
    return this.mset([{ key, value, ttlMs }]);
  }

  async mset(data: Array<{ key: string; value: unknown; ttlMs?: number }>): Promise<void> {
    const response = await fetch(this.endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to put keys: ${response.statusText}`);
    }
  }

  async delete(key: string): Promise<void> {
    return this.mdelete([key]);
  }

  async mdelete(keys: string[]): Promise<void> {
    const url = new URL(this.endpoint);

    keys.forEach((key) => url.searchParams.append('key', key));

    const response = await fetch(url, {
      method: 'DELETE',
      headers: { 'x-api-key': this.apiKey },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete keys: ${response.statusText}`);
    }
  }
}

const memoryKv = new MemoryKvAdapter();

export class BcKvAdapter implements KvAdapter {
  private kv = new Kv();
  private memoryKv = memoryKv;

  async get<Data>(key: string) {
    const [value] = await this.mget<Data>(key);

    return value ?? null;
  }

  async mget<Data>(...keys: string[]) {
    const memoryValues = (await this.memoryKv.mget<Data>(...keys)).filter(Boolean);

    if (memoryValues.length === keys.length) {
      return memoryValues;
    }

    const remoteKvValues = await this.kv.mget<Data[]>(keys);

    await Promise.all(
      remoteKvValues.map(async (value, index) => {
        const key = keys[index];

        if (!key) {
          return;
        }

        await this.memoryKv.set(key, value);
      }),
    );

    return remoteKvValues;
  }

  async set<Data>(key: string, value: Data, opts?: { ttlMs?: number }) {
    const ex = opts?.ttlMs ? Date.now() + opts.ttlMs : undefined;

    await Promise.all([
      this.memoryKv.set(key, value, { ex }),
      this.kv.set(key, value, opts?.ttlMs),
    ]);

    return value;
  }
}
