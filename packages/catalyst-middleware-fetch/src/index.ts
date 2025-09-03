/**
 * Catalyst Middleware Fetch
 *
 * A fetch implementation that uses unstorage for caching across different hosting environments.
 * Supports LRU memory cache (default), Vercel Runtime Cache, Upstash Redis, and Cloudflare Cache API.
 */

import { createStorage } from 'unstorage';
import type { Storage } from 'unstorage';
import type { CachedFetchOptions, StorageOptions, StorageAdapter, CloudflareContext } from './types';

/**
 * Logger utility for verbose logging when CACHED_MIDDLEWARE_FETCH_LOGGER=1
 */
const isLoggingEnabled = (): boolean => {
  return typeof process !== 'undefined' && process.env.CACHED_MIDDLEWARE_FETCH_LOGGER === '1';
};

const logger = {
  log: (...args: unknown[]) => {
    if (isLoggingEnabled()) {
      console.log('[catalyst-fetch]', ...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (isLoggingEnabled()) {
      console.warn('[catalyst-fetch]', ...args);
    }
  },
  error: (...args: unknown[]) => {
    if (isLoggingEnabled()) {
      console.error('[catalyst-fetch]', ...args);
    }
  },
};

/**
 * Environment detection utilities
 * TODO: These detection methods can be refined based on specific deployment needs
 */
export const isVercelEnvironment = (): boolean => {
  return typeof process !== 'undefined' && process.env.VERCEL === '1';
};

export const isCloudflareEnvironment = (): boolean => {
  return (
    typeof caches !== 'undefined' &&
    typeof (caches as unknown as { default?: Cache }).default !== 'undefined' &&
    typeof globalThis !== 'undefined' &&
    typeof globalThis.fetch !== 'undefined'
  );
};

export const isUpstashEnvironment = (): boolean => {
  return (
    typeof process !== 'undefined' &&
    !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  );
};

/**
 * Detect the best storage adapter for the current environment
 */
export const detectStorageAdapter = (): StorageAdapter => {
  logger.log('Detecting storage adapter...');
  
  if (isVercelEnvironment()) {
    logger.log('Detected Vercel environment, using vercel-runtime adapter');
    return 'vercel-runtime';
  }
  if (isUpstashEnvironment()) {
    logger.log('Detected Upstash environment, using upstash adapter');
    return 'upstash';
  }
  if (isCloudflareEnvironment()) {
    logger.log('Detected Cloudflare environment, using cloudflare adapter');
    return 'cloudflare';
  }
  
  logger.log('No specific environment detected, using memory adapter');
  return 'memory';
};

/**
 * Generate cache key for requests
 */
const generateCacheKey = (input: RequestInfo | URL, init?: CachedFetchOptions): string => {
  let url: string;

  if (typeof input === 'string') {
    url = input;
  } else if (input instanceof URL) {
    url = input.href;
  } else {
    url = input.url;
  }

  const method = init?.method ?? 'GET';
  const headers = init?.headers ?? {};
  const body = init?.body ?? '';

  // Create a normalized key that includes URL, method, headers, and body
  const normalizedHeaders = Object.keys(headers)
    .sort()
    .reduce<Record<string, string>>((acc, key) => {
      const headerValue = (headers as Record<string, string>)[key];
      acc[key.toLowerCase()] = headerValue;
      return acc;
    }, {});

  const keyData = {
    url,
    method: method.toUpperCase(),
    headers: normalizedHeaders,
    body: typeof body === 'string' ? body : '',
  };

  return `fetch:${Buffer.from(JSON.stringify(keyData)).toString('base64')}`;
};

/**
 * Convert Headers object to plain object for serialization
 */
const headersToObject = (headers: Headers): Record<string, string> => {
  const obj: Record<string, string> = {};
  headers.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
};

/**
 * Create a cached response entry
 */
interface CachedResponse {
  data: string; // base64 encoded response body
  headers: Record<string, string>;
  status: number;
  statusText: string;
  timestamp: number;
  revalidateAfter?: number;
  expiresAt?: number;
  tags?: string[];
  url: string;
}

/**
 * Cached fetch implementation using unstorage
 */
export class CatalystFetch {
  private storage: Storage;
  private revalidationQueue = new Set<string>();

  constructor(storage: Storage) {
    this.storage = storage;
  }

  /**
   * Main fetch method with caching
   */
  async fetch(input: RequestInfo | URL, init?: CachedFetchOptions): Promise<Response> {
    const cacheKey = generateCacheKey(input, init);
    const now = Date.now();
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

    logger.log(`Fetching: ${init?.method || 'GET'} ${url}`);
    logger.log(`Cache key: ${cacheKey}`);

    // Handle standard Next.js cache directives
    const cacheMode = init?.cache || 'default';
    logger.log(`Cache mode: ${cacheMode}`);
    
    // no-store: Skip cache entirely
    if (cacheMode && (cacheMode as string) === 'no-store') {
      logger.log('Cache mode is no-store, skipping cache entirely');
      return this.performFetch(input, init);
    }

    // Try to get from cache
    const cachedEntry = await this.getCachedResponse(cacheKey);

    // force-cache: Return cached version if available, even if stale
    if (cacheMode && (cacheMode as string) === 'force-cache' && cachedEntry) {
      logger.log('Cache mode is force-cache, returning cached entry regardless of staleness');
      return this.createResponseFromCache(cachedEntry);
    }

    // Check if we have a valid cached entry
    if (cachedEntry && this.isCacheEntryValid(cachedEntry, now)) {
      const isStale = this.shouldRevalidate(cachedEntry, now);
      const age = Math.floor((now - cachedEntry.timestamp) / 1000);
      
      if (isStale) {
        logger.log(`Cache STALE for ${url} (age: ${age}s)`);
        // Check if we need background revalidation
        if (!this.revalidationQueue.has(cacheKey)) {
          logger.log(`Scheduling background revalidation for ${url}`);
          this.scheduleBackgroundRevalidation(input, init, cacheKey);
        } else {
          logger.log(`Background revalidation already scheduled for ${url}`);
        }
      } else {
        logger.log(`Cache HIT for ${url} (age: ${age}s)`);
      }

      return this.createResponseFromCache(cachedEntry);
    }

    if (cachedEntry) {
      logger.log(`Cache EXPIRED for ${url}, fetching fresh data`);
    } else {
      logger.log(`Cache MISS for ${url}, fetching fresh data`);
    }

    // For reload: Always fetch fresh, but cache the result
    // For default: Fetch if not cached or expired
    const response = await this.performFetch(input, init);
    
    // Only cache if not no-store
    if (!cacheMode || (cacheMode as string) !== 'no-store') {
      await this.cacheResponse(cacheKey, response, init);
    }

    return response;
  }

  /**
   * Clear the cache
   */
  async clear(): Promise<void> {
    logger.log('Clearing cache storage');
    await this.storage.clear();
    this.revalidationQueue.clear();
    logger.log('Cache cleared successfully');
  }

  /**
   * Get cached response from storage
   */
  private async getCachedResponse(cacheKey: string): Promise<CachedResponse | null> {
    try {
      logger.log(`Getting cached response for key: ${cacheKey}`);
      const cached = await this.storage.getItem<CachedResponse>(cacheKey);
      if (cached) {
        logger.log(`Found cached response for key: ${cacheKey}`);
      } else {
        logger.log(`No cached response found for key: ${cacheKey}`);
      }
      return cached;
    } catch (error) {
      logger.error(`Error getting cached response for key ${cacheKey}:`, error);
      return null;
    }
  }

  /**
   * Check if cache entry is still valid
   */
  private isCacheEntryValid(entry: CachedResponse, now: number): boolean {
    return !entry.expiresAt || entry.expiresAt > now;
  }

  /**
   * Check if cache entry should be revalidated
   */
  private shouldRevalidate(entry: CachedResponse, now: number): boolean {
    return !!entry.revalidateAfter && entry.revalidateAfter <= now;
  }

  /**
   * Schedule background revalidation
   */
  private scheduleBackgroundRevalidation(
    input: RequestInfo | URL,
    init: CachedFetchOptions | undefined,
    cacheKey: string,
  ): void {
    this.revalidationQueue.add(cacheKey);

    const revalidatePromise = this.performBackgroundRevalidation(input, init, cacheKey);

    // Use waitUntil if available
    if (typeof globalThis !== 'undefined' && 'waitUntil' in globalThis) {
      try {
        globalThis.waitUntil(revalidatePromise);
      } catch {
        revalidatePromise.catch(() => {
          // Silently handle revalidation errors
        });
      }
    } else {
      revalidatePromise.catch(() => {
        // Silently handle revalidation errors
      });
    }
  }

  /**
   * Perform background revalidation
   */
  private async performBackgroundRevalidation(
    input: RequestInfo | URL,
    init: CachedFetchOptions | undefined,
    cacheKey: string,
  ): Promise<void> {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    
    try {
      logger.log(`Starting background revalidation for ${url}`);
      const response = await this.performFetch(input, init);
      await this.cacheResponse(cacheKey, response, init);
      logger.log(`Background revalidation completed for ${url}`);
    } catch (error) {
      logger.error(`Background revalidation failed for ${url}:`, error);
    } finally {
      this.revalidationQueue.delete(cacheKey);
      logger.log(`Removed ${url} from revalidation queue`);
    }
  }

  /**
   * Perform the actual fetch request
   */
  private async performFetch(
    input: RequestInfo | URL,
    init?: CachedFetchOptions,
  ): Promise<Response> {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const method = init?.method || 'GET';
    
    logger.log(`Performing fetch: ${method} ${url}`);
    
    // Remove our custom cache options before making the request
    const { cache: _cache, next: _next, ...fetchInit } = init ?? {};
    
    try {
      const response = await fetch(input, fetchInit);
      logger.log(`Fetch completed: ${method} ${url} - Status: ${response.status} ${response.statusText}`);
      return response;
    } catch (error) {
      logger.error(`Fetch failed: ${method} ${url}:`, error);
      throw error;
    }
  }

  /**
   * Cache the response
   */
  private async cacheResponse(
    cacheKey: string,
    response: Response,
    init?: CachedFetchOptions,
  ): Promise<void> {
    // Only cache successful responses
    if (!response.ok) {
      logger.log(`Not caching response with status ${response.status} for ${response.url}`);
      return;
    }

    logger.log(`Caching response for ${response.url}`);

    const now = Date.now();
    const headers = headersToObject(response.headers);

    // Read the response body
    const clonedResponse = response.clone();
    const arrayBuffer = await clonedResponse.arrayBuffer();
    const data = Buffer.from(arrayBuffer).toString('base64');

    // Calculate expiration and revalidation times based on Next.js conventions
    const revalidateTime = init?.next?.revalidate;

    let revalidateAfter: number | undefined;
    let expiresAt: number | undefined;

    // Handle Next.js revalidate values
    if (revalidateTime === false || revalidateTime === 0) {
      // revalidate: false or 0 means cache indefinitely (no revalidation)
      // Set a very long expiration (1 year)
      expiresAt = now + 365 * 24 * 60 * 60 * 1000;
      logger.log(`Caching indefinitely (revalidate: ${revalidateTime})`);
    } else if (typeof revalidateTime === 'number' && revalidateTime > 0) {
      // revalidate: N means revalidate after N seconds
      revalidateAfter = now + revalidateTime * 1000;
      // Set expiration to 24 hours or revalidate time * 10, whichever is longer
      expiresAt = now + Math.max(24 * 60 * 60 * 1000, revalidateTime * 1000 * 10);
      logger.log(`Caching with revalidate: ${revalidateTime}s, expires: ${Math.floor((expiresAt - now) / 1000)}s`);
    } else {
      // No revalidate specified, use default behavior (1 hour revalidation, 24 hour expiration)
      revalidateAfter = now + 60 * 60 * 1000; // 1 hour
      expiresAt = now + 24 * 60 * 60 * 1000; // 24 hours
      logger.log('Caching with default timing (1h revalidate, 24h expire)');
    }

    const cacheEntry: CachedResponse = {
      data,
      headers,
      status: response.status,
      statusText: response.statusText,
      timestamp: now,
      revalidateAfter,
      expiresAt,
      tags: init?.next?.tags,
      url: response.url,
    };

    try {
      // Calculate TTL for storage adapters that support it
      let ttl: number | undefined;
      if (expiresAt) {
        ttl = Math.max(1, Math.floor((expiresAt - now) / 1000));
      }

      logger.log(`Storing cache entry with key: ${cacheKey}, TTL: ${ttl}s`);
      await this.storage.setItem(cacheKey, cacheEntry, { ttl });
      logger.log(`Successfully cached response for ${response.url}`);
    } catch (error) {
      logger.error(`Failed to cache response for ${response.url}:`, error);
    }
  }

  /**
   * Create a Response object from cached entry
   */
  private createResponseFromCache(entry: CachedResponse): Response {
    const headers = new Headers(entry.headers);

    // Add standard cache status headers matching cached-middleware-fetch-next
    const now = Date.now();
    const isStale = this.shouldRevalidate(entry, now);
    
    headers.set('X-Cache-Status', isStale ? 'STALE' : 'HIT');
    headers.set('X-Cache-Age', Math.floor((now - entry.timestamp) / 1000).toString());

    if (entry.expiresAt) {
      const expiresIn = Math.max(0, Math.floor((entry.expiresAt - now) / 1000));
      headers.set('X-Cache-TTL', expiresIn.toString());
      
      // Add expiration date in RFC 7231 format
      const expiresDate = new Date(entry.expiresAt);
      headers.set('X-Cache-Expires', expiresDate.toUTCString());
    }

    // Decode base64 data back to ArrayBuffer
    const buffer = Buffer.from(entry.data, 'base64');

    return new Response(buffer, {
      status: entry.status,
      statusText: entry.statusText,
      headers,
    });
  }
}

/**
 * Create storage with dynamic driver loading
 * 
 * Note: To extend with additional unstorage drivers (Redis, MongoDB, etc.),
 * customers can create their own factory function that handles additional
 * adapter types and falls back to this function for built-in adapters.
 * See README.md for examples.
 */
export const createCacheStorage = async (options: StorageOptions = {}): Promise<Storage> => {
  const adapter = options.adapter ?? detectStorageAdapter();

  logger.log(`Creating cache storage with adapter: ${adapter}`);
  if (options.base) {
    logger.log(`Using base prefix: ${options.base}`);
  }
  if (options.ttl) {
    logger.log(`Using TTL: ${options.ttl}s`);
  }

  switch (adapter) {
    case 'vercel-runtime': {
      logger.log('Loading Vercel Runtime Cache driver');
      const { default: vercelRuntimeCacheDriver } = await import('unstorage/drivers/vercel-runtime-cache');
      const storage = createStorage({
        driver: vercelRuntimeCacheDriver({
          base: options.base,
          ttl: options.ttl,
        }),
      });
      logger.log('Vercel Runtime Cache storage created successfully');
      return storage;
    }

    case 'upstash': {
      logger.log('Loading Upstash Redis driver');
      const { default: upstashDriver } = await import('unstorage/drivers/upstash');
      const storage = createStorage({
        driver: upstashDriver({
          base: options.base,
          url: options.upstash?.url ?? process.env.UPSTASH_REDIS_REST_URL,
          token: options.upstash?.token ?? process.env.UPSTASH_REDIS_REST_TOKEN,
          ttl: options.ttl,
        }),
      });
      logger.log('Upstash Redis storage created successfully');
      return storage;
    }

    case 'cloudflare': {
      logger.log('Loading Cloudflare Cache driver');
      const { default: cloudflareCacheDriver } = await import('./drivers/cloudflare-cache');
      const storage = createStorage({
        driver: cloudflareCacheDriver({
          base: options.base,
          ttl: options.ttl,
          ctx: options.cloudflare?.ctx,
        }),
      });
      logger.log('Cloudflare Cache storage created successfully');
      return storage;
    }

    case 'memory':
    default: {
      logger.log(`Loading LRU Cache driver (maxSize: ${options.maxSize ?? 500})`);
      const { default: lruCacheDriver } = await import('unstorage/drivers/lru-cache');
      const storage = createStorage({
        driver: lruCacheDriver({
          max: options.maxSize ?? 500,
          ttl: options.ttl ? options.ttl * 1000 : 24 * 60 * 60 * 1000, // Convert to milliseconds for LRU
        }),
      });

      // If base is provided, mount the driver at the base path
      if (options.base) {
        logger.log(`Mounting LRU Cache driver at base path: ${options.base}`);
        const baseStorage = createStorage({});
        baseStorage.mount(options.base, lruCacheDriver({
          max: options.maxSize ?? 500,
          ttl: options.ttl ? options.ttl * 1000 : 24 * 60 * 60 * 1000,
        }));
        logger.log('LRU Cache storage with base path created successfully');
        return baseStorage;
      }

      logger.log('LRU Cache storage created successfully');
      return storage;
    }
  }
};

/**
 * Global fetch instances
 */
let defaultCatalystFetch: CatalystFetch | null = null;

/**
 * Get or create the default fetch implementation
 */
export const getDefaultFetch = async (options?: StorageOptions): Promise<CatalystFetch> => {
  if (!defaultCatalystFetch) {
    const storage = await createCacheStorage(options);
    defaultCatalystFetch = new CatalystFetch(storage);
  }
  return defaultCatalystFetch;
};

/**
 * Create a new fetch instance with custom options
 */
export const createFetch = async (options?: StorageOptions): Promise<CatalystFetch> => {
  const storage = await createCacheStorage(options);
  return new CatalystFetch(storage);
};

/**
 * Convenience fetch function using default instance
 */
export const cachedFetch = async (
  input: RequestInfo | URL,
  init?: CachedFetchOptions,
  options?: StorageOptions,
): Promise<Response> => {
  const catalystFetch = await getDefaultFetch(options);
  return catalystFetch.fetch(input, init);
};

/**
 * Environment information for debugging
 */
export const getEnvironmentInfo = async () => {
  const adapter = detectStorageAdapter();
  
  return {
    adapter,
    isVercel: isVercelEnvironment(),
    isCloudflare: isCloudflareEnvironment(),
    isUpstash: isUpstashEnvironment(),
    environment: {
      VERCEL: typeof process !== 'undefined' ? process.env.VERCEL : undefined,
      NODE_ENV: typeof process !== 'undefined' ? process.env.NODE_ENV : undefined,
      UPSTASH_REDIS_REST_URL: typeof process !== 'undefined' ? !!process.env.UPSTASH_REDIS_REST_URL : undefined,
    },
  };
};

/**
 * Reset cached instances (useful for testing)
 */
export const resetCache = (): void => {
  defaultCatalystFetch = null;
};

// Re-export types
export type { CachedFetchOptions, StorageOptions, StorageAdapter, CloudflareContext } from './types';

// CatalystFetch is already exported above

// Legacy compatibility exports
export const getFetchImplementation = async (options?: StorageOptions) => {
  const catalystFetch = await getDefaultFetch(options);
  return {
    fetch: catalystFetch.fetch.bind(catalystFetch),
    name: `catalyst-fetch-${detectStorageAdapter()}`,
  };
};

export const getfetch = async (options?: StorageOptions) => {
  const catalystFetch = await getDefaultFetch(options);
  return catalystFetch.fetch.bind(catalystFetch);
};