import { KVAdapter, SetCommandOptions } from './types';

/**
 * Simple memory-based KV adapter for fallback caching
 */
export class MemoryKVAdapter implements KVAdapter {
  private store = new Map<string, { value: any; expiry?: number }>();

  async get<Data>(key: string): Promise<Data | null> {
    const item = this.store.get(key);
    
    if (!item) {
      return null;
    }

    if (item.expiry && Date.now() > item.expiry) {
      this.store.delete(key);
      return null;
    }

    return item.value as Data;
  }

  async mget<Data>(...keys: string[]): Promise<(Data | null)[]> {
    return Promise.all(keys.map(key => this.get<Data>(key)));
  }

  async set<Data>(key: string, value: Data, opts?: SetCommandOptions): Promise<Data> {
    const expiry = opts?.ttl ? Date.now() + opts.ttl : undefined;
    this.store.set(key, { value, expiry });
    return value;
  }

  clear(): void {
    this.store.clear();
  }
}

/**
 * KV wrapper with automatic memory fallback and caching
 */
export class KVWithMemoryFallback implements KVAdapter {
  private memoryKv = new MemoryKVAdapter();

  constructor(
    private primaryKv?: KVAdapter,
    private config: { logger?: boolean } = {},
  ) {}

  async get<Data>(key: string): Promise<Data | null> {
    const [value] = await this.mget<Data>(key);
    return value ?? null;
  }

  async mget<Data>(...keys: string[]): Promise<(Data | null)[]> {
    // Try memory cache first
    const memoryValues = await this.memoryKv.mget<Data>(...keys);
    const cachedIndices = new Set<number>();
    
    memoryValues.forEach((value, index) => {
      if (value !== null) {
        cachedIndices.add(index);
      }
    });

    // If all values are in memory, return them
    if (cachedIndices.size === keys.length) {
      this.log(`MGET (memory) - Keys: ${keys.toString()}`);
      return memoryValues;
    }

    // Otherwise, fetch missing values from primary KV
    if (!this.primaryKv) {
      return memoryValues;
    }

    try {
      const values = await this.primaryKv.mget<Data>(...keys);
      
      this.log(`MGET (primary) - Keys: ${keys.toString()}`);

      // Store values in memory cache
      await Promise.all(
        values.map(async (value, index) => {
          const key = keys[index];
          if (key && value !== null) {
            await this.memoryKv.set(key, value);
          }
        }),
      );

      return values;
    } catch (error) {
      this.log(`MGET error, falling back to memory: ${error}`);
      return memoryValues;
    }
  }

  async set<Data>(key: string, value: Data, opts?: SetCommandOptions): Promise<Data> {
    this.log(`SET - Key: ${key}`);

    // Always set in memory
    await this.memoryKv.set(key, value, opts);

    // Try to set in primary KV
    if (this.primaryKv) {
      try {
        await this.primaryKv.set(key, value, opts);
      } catch (error) {
        this.log(`SET error in primary KV: ${error}`);
      }
    }

    return value;
  }

  private log(message: string): void {
    if (this.config.logger) {
      console.log(`[Catalyst Routes] KV ${message}`);
    }
  }
}