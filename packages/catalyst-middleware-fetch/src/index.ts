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
  if (isVercelEnvironment()) {
    return 'vercel-runtime';
  }
  if (isUpstashEnvironment()) {
    return 'upstash';
  }
  if (isCloudflareEnvironment()) {
    return 'cloudflare';
  }
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

    // Handle no-store cache directive
    if (init?.cache === 'no-store') {
      return this.performFetch(input, init);
    }

    // Try to get from cache
    const cachedEntry = await this.getCachedResponse(cacheKey);

    // Check if we have a valid cached entry
    if (cachedEntry && this.isCacheEntryValid(cachedEntry, now)) {
      // Check if we need background revalidation
      if (this.shouldRevalidate(cachedEntry, now) && !this.revalidationQueue.has(cacheKey)) {
        this.scheduleBackgroundRevalidation(input, init, cacheKey);
      }

      return this.createResponseFromCache(cachedEntry);
    }

    // For force-cache, return stale if available
    if (init?.cache === 'force-cache' && cachedEntry) {
      return this.createResponseFromCache(cachedEntry);
    }

    // Perform fresh fetch and cache the result
    const response = await this.performFetch(input, init);
    await this.cacheResponse(cacheKey, response, init);

    return response;
  }

  /**
   * Clear the cache
   */
  async clear(): Promise<void> {
    await this.storage.clear();
    this.revalidationQueue.clear();
  }

  /**
   * Get cached response from storage
   */
  private async getCachedResponse(cacheKey: string): Promise<CachedResponse | null> {
    try {
      const cached = await this.storage.getItem<CachedResponse>(cacheKey);
      return cached;
    } catch {
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
    try {
      const response = await this.performFetch(input, init);
      await this.cacheResponse(cacheKey, response, init);
    } finally {
      this.revalidationQueue.delete(cacheKey);
    }
  }

  /**
   * Perform the actual fetch request
   */
  private async performFetch(
    input: RequestInfo | URL,
    init?: CachedFetchOptions,
  ): Promise<Response> {
    // Remove our custom cache options before making the request
    const { cache: _cache, next: _next, ...fetchInit } = init ?? {};
    return fetch(input, fetchInit);
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
      return;
    }

    const now = Date.now();
    const headers = headersToObject(response.headers);

    // Read the response body
    const clonedResponse = response.clone();
    const arrayBuffer = await clonedResponse.arrayBuffer();
    const data = Buffer.from(arrayBuffer).toString('base64');

    // Calculate expiration and revalidation times
    const revalidateTime = init?.next?.revalidate;
    const expiresTime = init?.next?.expires;

    let revalidateAfter: number | undefined;
    let expiresAt: number | undefined;

    if (typeof revalidateTime === 'number' && revalidateTime > 0) {
      revalidateAfter = now + revalidateTime * 1000;
    }

    if (typeof expiresTime === 'number' && expiresTime > 0) {
      expiresAt = now + expiresTime * 1000;
    } else if (typeof revalidateTime === 'number' && revalidateTime > 0) {
      // Default expires to 24 hours if only revalidate is set
      expiresAt = now + 24 * 60 * 60 * 1000;
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

      await this.storage.setItem(cacheKey, cacheEntry, { ttl });
    } catch {
      // Silently handle cache errors
    }
  }

  /**
   * Create a Response object from cached entry
   */
  private createResponseFromCache(entry: CachedResponse): Response {
    const headers = new Headers(entry.headers);

    // Add cache status headers
    headers.set('X-Cache-Status', this.shouldRevalidate(entry, Date.now()) ? 'STALE' : 'HIT');
    headers.set('X-Cache-Age', Math.floor((Date.now() - entry.timestamp) / 1000).toString());

    if (entry.expiresAt) {
      const expiresIn = Math.max(0, Math.floor((entry.expiresAt - Date.now()) / 1000));
      headers.set('X-Cache-Expires-In', expiresIn.toString());
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

  switch (adapter) {
    case 'vercel-runtime': {
      const { default: vercelRuntimeCacheDriver } = await import('unstorage/drivers/vercel-runtime-cache');
      return createStorage({
        driver: vercelRuntimeCacheDriver({
          base: options.base,
          ttl: options.ttl,
        }),
      });
    }

    case 'upstash': {
      const { default: upstashDriver } = await import('unstorage/drivers/upstash');
      return createStorage({
        driver: upstashDriver({
          base: options.base,
          url: options.upstash?.url ?? process.env.UPSTASH_REDIS_REST_URL,
          token: options.upstash?.token ?? process.env.UPSTASH_REDIS_REST_TOKEN,
          ttl: options.ttl,
        }),
      });
    }

    case 'cloudflare': {
      const { default: cloudflareCacheDriver } = await import('./drivers/cloudflare-cache');
      return createStorage({
        driver: cloudflareCacheDriver({
          base: options.base,
          ttl: options.ttl,
          ctx: options.cloudflare?.ctx,
        }),
      });
    }

    case 'memory':
    default: {
      const { default: lruCacheDriver } = await import('unstorage/drivers/lru-cache');
      const storage = createStorage({
        driver: lruCacheDriver({
          max: options.maxSize ?? 500,
          ttl: options.ttl ? options.ttl * 1000 : 24 * 60 * 60 * 1000, // Convert to milliseconds for LRU
        }),
      });

      // If base is provided, mount the driver at the base path
      if (options.base) {
        const baseStorage = createStorage({});
        baseStorage.mount(options.base, lruCacheDriver({
          max: options.maxSize ?? 500,
          ttl: options.ttl ? options.ttl * 1000 : 24 * 60 * 60 * 1000,
        }));
        return baseStorage;
      }

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