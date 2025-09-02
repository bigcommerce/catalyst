/**
 * Memory-cached fetch implementation with LRU eviction and background revalidation
 * Mirrors the cached-middleware-fetch-next interface for consistent behavior
 */

import { LRUCache } from 'lru-cache';

import type { CachedFetchOptions } from './types';

/**
 * Cache entry structure for storing fetch responses
 */
interface CacheEntry {
  data: ArrayBuffer;
  headers: Record<string, string>;
  status: number;
  statusText: string;
  timestamp: number;
  revalidateAfter?: number;
  expiresAt?: number;
  tags?: string[];
  isBinary?: boolean;
  contentType?: string;
  url: string;
}

/**
 * Cache key generation for consistent cache lookups
 * @param {RequestInfo | URL} input - Request input
 * @param {CachedFetchOptions} init - Fetch options
 * @returns {string} Generated cache key
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

  return JSON.stringify({
    url,
    method: method.toUpperCase(),
    headers: normalizedHeaders,
    body: typeof body === 'string' ? body : '',
  });
};

/**
 * Convert Headers object to plain object for serialization
 * @param {Headers} headers - Headers object to convert
 * @returns {Record<string, string>} Plain object representation
 */
const headersToObject = (headers: Headers): Record<string, string> => {
  const obj: Record<string, string> = {};

  headers.forEach((value, key) => {
    obj[key] = value;
  });

  return obj;
};

/**
 * Check if content is binary based on content-type
 * @param {string} contentType - Content type to check
 * @returns {boolean} True if content is binary
 */
const isBinaryContent = (contentType?: string): boolean => {
  if (!contentType) return false;

  const binaryTypes = [
    'image/',
    'video/',
    'audio/',
    'application/octet-stream',
    'application/pdf',
    'application/zip',
    'application/gzip',
  ];

  return binaryTypes.some((type) => contentType.toLowerCase().includes(type));
};

/**
 * Memory-cached fetch implementation
 */
export class MemoryCachedFetch {
  private cache: LRUCache<string, CacheEntry>;
  private revalidationQueue = new Set<string>();

  constructor(options: { maxSize?: number; ttl?: number } = {}) {
    this.cache = new LRUCache<string, CacheEntry>({
      max: options.maxSize ?? 500,
      ttl: options.ttl ?? 1000 * 60 * 60 * 24, // 24 hours default TTL
      allowStale: true, // Allow serving stale content during revalidation
    });
  }

  /**
   * Main fetch method with caching and revalidation
   * @param {RequestInfo | URL} input - Request URL or Request object
   * @param {CachedFetchOptions} init - Fetch options with cache configuration
   * @returns {Promise<Response>} Cached or fresh response
   */
  async fetch(input: RequestInfo | URL, init?: CachedFetchOptions): Promise<Response> {
    const cacheKey = generateCacheKey(input, init);
    const now = Date.now();

    // Handle no-store cache directive
    if (init?.cache === 'no-store') {
      return this.performFetch(input, init);
    }

    // Try to get from cache
    const cachedEntry = this.cache.get(cacheKey);

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
   * Clear the cache (useful for testing)
   * @returns {void}
   */
  clear(): void {
    this.cache.clear();
    this.revalidationQueue.clear();
  }

  /**
   * Get cache statistics
   * @returns {object} Cache statistics with size and maxSize properties
   */
  getStats(): { size: number; maxSize: number } {
    return {
      size: this.cache.size,
      maxSize: this.cache.max,
    };
  }

  /**
   * Check if cache entry is still valid
   * @param {CacheEntry} entry - Cache entry to check
   * @param {number} now - Current timestamp
   * @returns {boolean} True if entry is valid
   */
  private isCacheEntryValid(entry: CacheEntry, now: number): boolean {
    return !entry.expiresAt || entry.expiresAt > now;
  }

  /**
   * Check if cache entry should be revalidated
   * @param {CacheEntry} entry - Cache entry to check
   * @param {number} now - Current timestamp
   * @returns {boolean} True if entry should be revalidated
   */
  private shouldRevalidate(entry: CacheEntry, now: number): boolean {
    return !!entry.revalidateAfter && entry.revalidateAfter <= now;
  }

  /**
   * Schedule background revalidation using waitUntil if available
   * @param {RequestInfo | URL} input - Request input
   * @param {CachedFetchOptions | undefined} init - Fetch options
   * @param {string} cacheKey - Cache key for the request
   * @returns {void}
   */
  private scheduleBackgroundRevalidation(
    input: RequestInfo | URL,
    init: CachedFetchOptions | undefined,
    cacheKey: string,
  ): void {
    this.revalidationQueue.add(cacheKey);

    const revalidatePromise = this.performBackgroundRevalidation(input, init, cacheKey);

    // Use waitUntil if available (Vercel Functions)
    if (typeof globalThis !== 'undefined' && 'waitUntil' in globalThis) {
      try {
        globalThis.waitUntil(revalidatePromise);
      } catch {
        // Fallback to regular promise handling
        revalidatePromise.catch(() => {
          // Silently handle revalidation errors
        });
      }
    } else {
      // Fallback: don't await, but handle errors
      revalidatePromise.catch(() => {
        // Silently handle revalidation errors
      });
    }
  }

  /**
   * Perform background revalidation
   * @param {RequestInfo | URL} input - Request input
   * @param {CachedFetchOptions | undefined} init - Fetch options
   * @param {string} cacheKey - Cache key for the request
   * @returns {Promise<void>}
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
   * @param {RequestInfo | URL} input - Request input
   * @param {CachedFetchOptions} init - Fetch options
   * @returns {Promise<Response>} Fetch response
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
   * @param {string} cacheKey - Cache key for the response
   * @param {Response} response - Response to cache
   * @param {CachedFetchOptions} init - Fetch options
   * @returns {Promise<void>}
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
    const contentType = headers['content-type'];
    const isBinary = isBinaryContent(contentType);

    // Read the response body
    const clonedResponse = response.clone();
    const data = await clonedResponse.arrayBuffer();

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

    const cacheEntry: CacheEntry = {
      data,
      headers,
      status: response.status,
      statusText: response.statusText,
      timestamp: now,
      revalidateAfter,
      expiresAt,
      tags: init?.next?.tags,
      isBinary,
      contentType,
      url: response.url,
    };

    this.cache.set(cacheKey, cacheEntry);
  }

  /**
   * Create a Response object from cached entry
   * @param {CacheEntry} entry - Cached entry to convert
   * @returns {Response} Response object
   */
  private createResponseFromCache(entry: CacheEntry): Response {
    const headers = new Headers(entry.headers);

    // Add cache status headers
    headers.set('X-Cache-Status', this.shouldRevalidate(entry, Date.now()) ? 'STALE' : 'HIT');
    headers.set('X-Cache-Age', Math.floor((Date.now() - entry.timestamp) / 1000).toString());

    if (entry.expiresAt) {
      const expiresIn = Math.max(0, Math.floor((entry.expiresAt - Date.now()) / 1000));

      headers.set('X-Cache-Expires-In', expiresIn.toString());
    }

    return new Response(entry.data, {
      status: entry.status,
      statusText: entry.statusText,
      headers,
    });
  }
}

// Create a singleton instance
const memoryCachedFetch = new MemoryCachedFetch();

/**
 * Export the cached fetch function
 * @param {RequestInfo | URL} input - Request URL or Request object
 * @param {CachedFetchOptions} init - Fetch options with cache configuration
 * @returns {Promise<Response>} Cached or fresh response
 */
export const cachedFetch = (
  input: RequestInfo | URL,
  init?: CachedFetchOptions,
): Promise<Response> => {
  return memoryCachedFetch.fetch(input, init);
};

// Export singleton instance for direct access
export { memoryCachedFetch };
