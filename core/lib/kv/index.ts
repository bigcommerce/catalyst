import { MemoryKvAdapter } from './adapters/memory';
import { CacheLogger, timer } from './lib/cache-logger';
import { KvAdapter, SetCommandOptions } from './types';

interface TwoLayerKvConfig {
  logger?: boolean;
  loggerPrefix?: string;
}

export class TwoLayerKv implements KvAdapter {
  private memoryCache = new MemoryKvAdapter();
  private backendAdapter?: KvAdapter;
  private logger: CacheLogger;
  private backendName: string;

  constructor(
    private createBackendAdapter: () => Promise<KvAdapter>,
    private config: TwoLayerKvConfig = {},
    backendName = 'Backend',
  ) {
    this.backendName = backendName;
    this.logger = new CacheLogger({
      enabled: config.logger ?? false,
      prefix: config.loggerPrefix ?? '[KV Cache]',
    });
  }

  async get<Data>(key: string): Promise<Data | null> {
    const [value] = await this.mget<Data>(key);
    return value ?? null;
  }

  async mget<Data>(...keys: string[]): Promise<Array<Data | null>> {
    const startTime = timer();

    // Step 1: Check memory cache
    const memoryStartTime = timer();
    const memoryValues = await this.memoryCache.mget<Data>(...keys);
    const memoryTime = timer() - memoryStartTime;

    // Analyze memory hits
    const memoryHits = memoryValues.filter((value) => value !== null).length;
    const memoryMisses = keys.length - memoryHits;

    // If all values found in memory, return early
    if (memoryHits === keys.length) {
      const totalTime = timer() - startTime;
      
      this.logger.logOperation({
        operation: 'MGET',
        keys,
        memoryHits,
        backendHits: 0,
        totalMisses: 0,
        memoryTime,
        totalTime,
        backend: this.backendName,
      });

      return memoryValues;
    }

    // Step 2: Get missing keys from backend
    const backendStartTime = timer();
    const backend = await this.getBackendAdapter();
    
    // Identify keys that need to be fetched from backend
    const keysToFetch = keys.filter((_, index) => memoryValues[index] === null);
    const backendValues = await backend.mget<Data>(...keysToFetch);
    const backendTime = timer() - backendStartTime;

    // Step 3: Merge results and update memory cache
    const finalValues: Array<Data | null> = [];
    let backendIndex = 0;
    
    const backendValuesToCache: Array<{ key: string; value: Data }> = [];

    for (let i = 0; i < keys.length; i++) {
      const memoryValue = memoryValues[i];
      const currentKey = keys[i];
      
      if (memoryValue !== null && memoryValue !== undefined) {
        // Use value from memory
        finalValues[i] = memoryValue;
      } else {
        // Use value from backend
        const backendValue = backendValues[backendIndex];
        finalValues[i] = backendValue ?? null;
        
        // Queue for memory cache if not null and key exists
        if (backendValue !== null && backendValue !== undefined && currentKey) {
          backendValuesToCache.push({ key: currentKey, value: backendValue });
        }
        
        backendIndex++;
      }
    }

    // Update memory cache with backend values (don't await - fire and forget)
    if (backendValuesToCache.length > 0) {
      Promise.all(
        backendValuesToCache.map(({ key, value }) => this.memoryCache.set(key, value))
      ).catch((error) => {
        // eslint-disable-next-line no-console
        console.warn('Failed to update memory cache:', error);
      });
    }

    // Step 4: Calculate final statistics and log
    const backendHits = backendValues.filter((value) => value !== null).length;
    const totalMisses = finalValues.filter((value) => value === null).length;
    const totalTime = timer() - startTime;

    this.logger.logOperation({
      operation: 'MGET',
      keys,
      memoryHits,
      backendHits,
      totalMisses,
      memoryTime,
      backendTime,
      totalTime,
      backend: this.backendName,
    });

    return finalValues;
  }

  async set<Data>(key: string, value: Data, opts?: SetCommandOptions): Promise<Data | null> {
    const startTime = timer();

    // Step 1: Set in memory cache
    const memoryStartTime = timer();
    const memoryOpts = opts?.ttl ? { ex: opts.ttl } : undefined;
    await this.memoryCache.set(key, value, memoryOpts);
    const memoryTime = timer() - memoryStartTime;

    // Step 2: Set in backend
    const backendStartTime = timer();
    const backend = await this.getBackendAdapter();
    const result = await backend.set(key, value, opts);
    const backendTime = timer() - backendStartTime;

    const totalTime = timer() - startTime;

    this.logger.logOperation({
      operation: 'SET',
      keys: [key],
      memoryTime,
      backendTime,
      totalTime,
      options: opts,
      backend: this.backendName,
    });

    return result;
  }

  private async getBackendAdapter(): Promise<KvAdapter> {
    if (!this.backendAdapter) {
      this.backendAdapter = await this.createBackendAdapter();
    }
    return this.backendAdapter;
  }
}

async function createKVAdapter(): Promise<{ adapter: KvAdapter; name: string }> {
  if (process.env.VERCEL === '1') {
    const { RuntimeCacheAdapter } = await import('./adapters/vercel-runtime-cache');
    return { adapter: new RuntimeCacheAdapter(), name: 'Vercel Runtime Cache' };
  }

  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const { UpstashKvAdapter } = await import('./adapters/upstash');
    return { adapter: new UpstashKvAdapter(), name: 'Upstash Redis' };
  }

  return { adapter: new MemoryKvAdapter(), name: 'Memory Only' };
}

const createAdapterInstance = async () => {
  const { adapter, name } = await createKVAdapter();
  
  return new TwoLayerKv(
    async () => adapter,
    {
      logger:
        (process.env.NODE_ENV !== 'production' && process.env.KV_LOGGER !== 'false') ||
        process.env.KV_LOGGER === 'true',
      loggerPrefix: '[BigCommerce KV]',
    },
    name,
  );
};

export const kv = await createAdapterInstance();
