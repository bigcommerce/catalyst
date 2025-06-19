import { FetchCacheLogger, timer } from './lib/cache-logger';
import { MemoryFetchCacheAdapter } from './adapters/memory';
import { FetchCacheAdapter, FetchCacheOptions } from './types';

interface FetchCacheConfig {
  logger?: boolean;
  loggerPrefix?: string;
}

class TwoLayerFetchCache {
  private memoryCache = new MemoryFetchCacheAdapter();
  private backendAdapter?: FetchCacheAdapter;
  private logger: FetchCacheLogger;
  private backendName: string;

  constructor(
    private createBackendAdapter: () => Promise<FetchCacheAdapter>,
    private config: FetchCacheConfig = {},
    backendName = 'Backend',
  ) {
    this.backendName = backendName;
    this.logger = new FetchCacheLogger({
      enabled: config.logger ?? false,
      prefix: config.loggerPrefix ?? '[Fetch Cache]',
    });
  }

  async get<T>(cacheKey: string): Promise<T | null> {
    const [value] = await this.mget<T>(cacheKey);
    return value ?? null;
  }

  async mget<T>(...cacheKeys: string[]): Promise<Array<T | null>> {
    const startTime = timer();

    // Step 1: Check memory cache
    const memoryStartTime = timer();
    const memoryValues = await this.memoryCache.mget<T>(...cacheKeys);
    const memoryTime = timer() - memoryStartTime;

    // Analyze memory hits
    const memoryHits = memoryValues.filter((value) => value !== null).length;

    // If all values found in memory, return early
    if (memoryHits === cacheKeys.length) {
      const totalTime = timer() - startTime;

      this.logger.logOperation({
        operation: 'BATCH_FETCH',
        cacheKeys,
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
    const keysToFetch = cacheKeys.filter((_, index) => memoryValues[index] === null);
    const backendValues = await backend.mget<T>(...keysToFetch);
    const backendTime = timer() - backendStartTime;

    // Step 3: Merge results and update memory cache
    const finalValues: Array<T | null> = [];
    let backendIndex = 0;

    const backendValuesToCache: Array<{ key: string; value: T }> = [];

    for (let i = 0; i < cacheKeys.length; i++) {
      const memoryValue = memoryValues[i];
      const currentKey = cacheKeys[i];

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
        backendValuesToCache.map(({ key, value }) => this.memoryCache.set(key, value)),
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
      operation: 'BATCH_FETCH',
      cacheKeys,
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

  async set<T>(cacheKey: string, data: T, options: FetchCacheOptions = {}): Promise<T | null> {
    const startTime = timer();

    // Step 1: Set in memory cache
    const memoryStartTime = timer();
    await this.memoryCache.set(cacheKey, data, options);
    const memoryTime = timer() - memoryStartTime;

    // Step 2: Set in backend
    const backendStartTime = timer();
    const backend = await this.getBackendAdapter();
    const result = await backend.set(cacheKey, data, options);
    const backendTime = timer() - backendStartTime;

    const totalTime = timer() - startTime;

    this.logger.logOperation({
      operation: 'CACHE_SET',
      cacheKeys: [cacheKey],
      memoryTime,
      backendTime,
      totalTime,
      options,
      backend: this.backendName,
    });

    return result;
  }

  private async getBackendAdapter(): Promise<FetchCacheAdapter> {
    if (!this.backendAdapter) {
      this.backendAdapter = await this.createBackendAdapter();
    }
    return this.backendAdapter;
  }
}

async function createFetchCacheAdapter(): Promise<{ adapter: FetchCacheAdapter; name: string }> {
  // Feature detection for Cloudflare Workers
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (typeof globalThis !== 'undefined' && (globalThis as any).caches?.default) {
    const { CloudflareNativeFetchCacheAdapter } = await import('./adapters/cloudflare-native');
    return { adapter: new CloudflareNativeFetchCacheAdapter(), name: 'Cloudflare Native' };
  }

  // Vercel Edge Runtime
  if (process.env.VERCEL === '1') {
    const { VercelRuntimeCacheAdapter } = await import('./adapters/vercel-runtime-cache');
    return { adapter: new VercelRuntimeCacheAdapter(), name: 'Vercel Runtime Cache' };
  }

  // Upstash Redis
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const { UpstashRedisFetchCacheAdapter } = await import('./adapters/upstash-redis');
    return { adapter: new UpstashRedisFetchCacheAdapter(), name: 'Upstash Redis' };
  }

  // Fallback to memory-only
  return { adapter: new MemoryFetchCacheAdapter(), name: 'Memory Only' };
}

// Create the global fetch cache instance
const createFetchCacheInstance = async () => {
  const { adapter, name } = await createFetchCacheAdapter();

  return new TwoLayerFetchCache(
    async () => adapter,
    {
      logger:
        (process.env.NODE_ENV !== 'production' && process.env.FETCH_CACHE_LOGGER !== 'false') ||
        process.env.FETCH_CACHE_LOGGER === 'true',
      loggerPrefix: '[BigCommerce Fetch Cache]',
    },
    name,
  );
};

const fetchCacheInstance = await createFetchCacheInstance();

/**
 * Fetch data with TTL caching using a 2-layer cache strategy (memory + backend).
 *
 * This function provides a drop-in replacement for data fetching in Next.js middleware
 * where the normal fetch cache is not available.
 *
 * @param fetcher - Function that fetches the data (e.g., API call)
 * @param cacheKey - Unique key for caching this data
 * @param options - Cache options including TTL and tags
 *
 * @example
 * ```typescript
 * const userData = await fetchWithTTLCache(
 *   async () => {
 *     const response = await fetch('/api/user');
 *     return response.json();
 *   },
 *   'user:123',
 *   { ttl: 300 } // 5 minutes
 * );
 * ```
 */
export async function fetchWithTTLCache<T>(
  fetcher: () => Promise<T>,
  cacheKey: string,
  options: FetchCacheOptions = {},
): Promise<T> {
  const startTime = timer();

  // Try to get from cache first
  const cachedData = await fetchCacheInstance.get<T>(cacheKey);

  if (cachedData !== null) {
    const totalTime = timer() - startTime;

    fetchCacheInstance['logger'].logOperation({
      operation: 'FETCH',
      cacheKeys: [cacheKey],
      memoryHits: 1, // We don't know the source, but we got a hit
      backendHits: 0,
      totalMisses: 0,
      totalTime,
      backend: fetchCacheInstance['backendName'],
    });

    return cachedData;
  }

  // Cache miss - fetch fresh data
  const fetchStartTime = timer();
  const freshData = await fetcher();
  const fetchTime = timer() - fetchStartTime;

  // Store in cache (fire and forget)
  fetchCacheInstance.set(cacheKey, freshData, options).catch((error) => {
    // eslint-disable-next-line no-console
    console.warn('Failed to cache data:', error);
  });

  const totalTime = timer() - startTime;

  fetchCacheInstance['logger'].logOperation({
    operation: 'FETCH',
    cacheKeys: [cacheKey],
    memoryHits: 0,
    backendHits: 0,
    totalMisses: 1,
    backendTime: fetchTime, // This is the actual fetch time
    totalTime,
    backend: fetchCacheInstance['backendName'],
  });

  return freshData;
}

/**
 * Batch fetch multiple pieces of data with TTL caching.
 *
 * This is useful when you need to fetch multiple related pieces of data
 * and want to optimize cache hits.
 *
 * @param requests - Array of fetch requests with cache keys
 * @param options - Default cache options (can be overridden per request)
 *
 * @example
 * ```typescript
 * const results = await batchFetchWithTTLCache([
 *   {
 *     fetcher: () => getRoute(pathname, channelId),
 *     cacheKey: kvKey(pathname, channelId),
 *     options: { ttl: 86400 }
 *   },
 *   {
 *     fetcher: () => getStoreStatus(channelId),
 *     cacheKey: kvKey(STORE_STATUS_KEY, channelId),
 *     options: { ttl: 3600 }
 *   }
 * ]);
 * ```
 */
export async function batchFetchWithTTLCache<T>(
  requests: Array<{
    fetcher: () => Promise<T>;
    cacheKey: string;
    options?: FetchCacheOptions;
  }>,
  defaultOptions: FetchCacheOptions = {},
): Promise<Array<T | null>> {
  const cacheKeys = requests.map((req) => req.cacheKey);

  // Try to get all from cache first
  const cachedValues = await fetchCacheInstance.mget<T>(...cacheKeys);

  // Identify which ones need to be fetched
  const toFetch: Array<{ index: number; request: (typeof requests)[0] }> = [];

  cachedValues.forEach((value, index) => {
    if (value === null) {
      const request = requests[index];
      if (request) {
        toFetch.push({ index, request });
      }
    }
  });

  // Fetch missing data
  if (toFetch.length > 0) {
    const fetchPromises = toFetch.map(async ({ index, request }) => {
      const freshData = await request.fetcher();
      const options = { ...defaultOptions, ...request.options };

      // Store in cache (fire and forget)
      fetchCacheInstance.set(request.cacheKey, freshData, options).catch((error) => {
        // eslint-disable-next-line no-console
        console.warn('Failed to cache batch data:', error);
      });

      return { index, data: freshData };
    });

    const fetchResults = await Promise.all(fetchPromises);

    // Merge cached and fresh data
    const finalResults = [...cachedValues];
    fetchResults.forEach(({ index, data }) => {
      finalResults[index] = data;
    });

    return finalResults;
  }

  return cachedValues;
}

// Expose the cache instance for direct access if needed
export { fetchCacheInstance as fetchCache };
