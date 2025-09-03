/**
 * Cloudflare Workers cached fetch implementation
 * Uses Cloudflare's Cache API and mirrors cached-middleware-fetch-next business logic
 */

import type { CachedFetchOptions, CloudflareContext } from './types';

/**
 * Cloudflare Workers environment detection using feature detection
 * Based on the Cloudflare documentation and best practices from the search results
 * @returns {boolean} True if running in Cloudflare Workers environment
 */
export const isCloudflareWorkersEnvironment = (): boolean => {
  // Feature detection for Cloudflare Workers Cache API
  // Reference: https://developers.cloudflare.com/workers/runtime-apis/cache/
  return (
    typeof caches !== 'undefined' &&
    typeof (caches as unknown as { default?: Cache }).default !== 'undefined' &&
    typeof globalThis !== 'undefined' &&
    // Additional check for Workers-specific globals
    typeof globalThis.fetch !== 'undefined'
  );
};

/**
 * Check if we're in development mode based on environment variables
 * @param {Record<string, unknown>} env - Environment bindings (optional)
 * @returns {boolean} True if in development mode
 */
export const isCloudflareDevMode = (env?: Record<string, unknown>): boolean => {
  // Check for WORKER_ENV set via wrangler.toml or .dev.vars
  return env?.WORKER_ENV === 'development';
};

/**
 * Generate cache key for Cloudflare Cache API
 * @param {RequestInfo | URL} input - Request input
 * @param {CachedFetchOptions} init - Fetch options
 * @returns {Request} Cache key as Request object
 */
const generateCacheKey = (input: RequestInfo | URL, init?: CachedFetchOptions): Request => {
  let url: string;

  if (typeof input === 'string') {
    url = input;
  } else if (input instanceof URL) {
    url = input.href;
  } else {
    url = input.url;
  }

  // Create a normalized request for caching
  // Include method, headers, and body in the cache key calculation
  const method = init?.method ?? 'GET';
  const headers = new Headers(init?.headers);

  // Remove headers that shouldn't affect caching
  headers.delete('authorization');
  headers.delete('cookie');

  // Create cache key request
  return new Request(url, {
    method,
    headers,
    // Don't include body for GET requests
    body: method !== 'GET' && method !== 'HEAD' ? init?.body : undefined,
  });
};

/**
 * Create cache headers based on Next.js-style options
 * @param {CachedFetchOptions} init - Fetch options
 * @returns {Headers} Headers to add to cached response
 */
const createCacheHeaders = (init?: CachedFetchOptions): Headers => {
  const headers = new Headers();

  if (init?.next?.revalidate !== undefined) {
    if (init.next.revalidate === false) {
      // Cache indefinitely
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (typeof init.next.revalidate === 'number' && init.next.revalidate === 0) {
      // Don't cache
      headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    } else if (typeof init.next.revalidate === 'number') {
      // Cache with TTL
      headers.set(
        'Cache-Control',
        `public, max-age=${init.next.revalidate}, s-maxage=${init.next.revalidate}`,
      );
    }
  }

  if (init?.next?.tags) {
    // Add cache tags for purging
    headers.set('Cache-Tag', init.next.tags.join(','));
  }

  return headers;
};

/**
 * Check if a cached response is still valid
 * @param {Response} response - Cached response

 * @returns {boolean} True if response is still valid
 */
const isCacheEntryValid = (response: Response): boolean => {
  const cacheControl = response.headers.get('cache-control');

  if (!cacheControl) return true;

  // Parse max-age from cache-control header
  const maxAgeMatch = /max-age=(\d+)/.exec(cacheControl);

  if (!maxAgeMatch) return true;

  const maxAge = parseInt(maxAgeMatch[1], 10);
  const cacheDate = response.headers.get('date');

  if (!cacheDate) return true;

  const cachedTime = new Date(cacheDate).getTime();
  const now = Date.now();
  const age = (now - cachedTime) / 1000;

  return age < maxAge;
};

/**
 * Check if a cached response should be revalidated
 * @param {Response} response - Cached response
 * @param {CachedFetchOptions} init - Original fetch options
 * @returns {boolean} True if response should be revalidated
 */
const shouldRevalidate = (response: Response, init?: CachedFetchOptions): boolean => {
  const revalidateValue = init?.next?.revalidate;

  // Only proceed if revalidate is a positive number
  if (typeof revalidateValue !== 'number' || revalidateValue <= 0) {
    return false;
  }

  const cacheDate = response.headers.get('date');

  if (!cacheDate) return true;

  const cachedTime = new Date(cacheDate).getTime();
  const now = Date.now();
  const age = (now - cachedTime) / 1000;

  return age >= revalidateValue;
};

/**
 * Cloudflare Workers cached fetch implementation
 */
export class CloudflareCachedFetch {
  private cache: Cache;
  private revalidationQueue = new Set<string>();

  constructor(cacheName = 'default') {
    // Use Cloudflare's cache API
    // Reference: https://developers.cloudflare.com/workers/runtime-apis/cache/
    // For now, always use default cache to avoid Promise handling complexity
    this.cache = (caches as unknown as { default: Cache }).default;

    // Note: cacheName parameter is kept for future extensibility
    // when we can properly handle async cache initialization
    void cacheName; // Acknowledge parameter to avoid unused warning
  }

  /**
   * Main fetch method with Cloudflare caching
   * @param {RequestInfo | URL} input - Request URL or Request object
   * @param {CachedFetchOptions} init - Fetch options with cache configuration
   * @param {CloudflareContext} ctx - Cloudflare Workers execution context
   * @returns {Promise<Response>} Cached or fresh response
   */
  async fetch(
    input: RequestInfo | URL,
    init?: CachedFetchOptions,
    ctx?: CloudflareContext,
  ): Promise<Response> {
    const cacheKey = generateCacheKey(input, init);
    const cacheKeyUrl = cacheKey.url;

    // Handle no-store cache directive
    if (init?.cache === 'no-store') {
      return this.performFetch(input, init);
    }

    // Try to get from cache
    const cachedResponse = await this.cache.match(cacheKey);

    if (cachedResponse) {
      const isValid = isCacheEntryValid(cachedResponse);
      const needsRevalidation = shouldRevalidate(cachedResponse, init);

      // For force-cache, return even if stale
      if (init?.cache === 'force-cache') {
        return this.addCacheHeaders(cachedResponse.clone(), 'HIT');
      }

      // If valid, check if we need background revalidation
      if (isValid) {
        if (needsRevalidation && !this.revalidationQueue.has(cacheKeyUrl)) {
          this.scheduleBackgroundRevalidation(input, init, cacheKey, ctx);
        }

        return this.addCacheHeaders(cachedResponse.clone(), needsRevalidation ? 'STALE' : 'HIT');
      }
    }

    // Perform fresh fetch and cache the result
    const response = await this.performFetch(input, init);

    await this.cacheResponse(cacheKey, response.clone(), init);

    return this.addCacheHeaders(response, 'MISS');
  }

  /**
   * Clear the cache (useful for testing)
   * Note: Cloudflare Workers Cache API doesn't have a clear method
   * This is a no-op for compatibility
   * @returns {void}
   */
  clear(): void {
    // Cloudflare Workers Cache API doesn't support clearing all entries
    // This method exists for interface compatibility
    this.revalidationQueue.clear();
  }

  /**
   * Get cache statistics (limited in Cloudflare Workers)
   * @returns {object} Cache statistics
   */
  getStats(): { implementation: string; revalidationQueueSize: number } {
    return {
      implementation: 'cloudflare-cache-api',
      revalidationQueueSize: this.revalidationQueue.size,
    };
  }

  /**
   * Schedule background revalidation using Cloudflare's ctx.waitUntil
   * @param {RequestInfo | URL} input - Request input
   * @param {CachedFetchOptions} init - Fetch options
   * @param {Request} cacheKey - Cache key
   * @param {CloudflareContext} ctx - Cloudflare Workers execution context
   * @returns {void}
   */
  private scheduleBackgroundRevalidation(
    input: RequestInfo | URL,
    init: CachedFetchOptions | undefined,
    cacheKey: Request,
    ctx?: CloudflareContext,
  ): void {
    const cacheKeyUrl = cacheKey.url;

    this.revalidationQueue.add(cacheKeyUrl);

    const revalidatePromise = this.performBackgroundRevalidation(input, init, cacheKey);

    // Use Cloudflare's ctx.waitUntil for background processing
    // Reference: https://developers.cloudflare.com/workers/runtime-apis/context/#waituntil
    if (ctx?.waitUntil) {
      ctx.waitUntil(revalidatePromise);
    } else {
      // Fallback: don't await, but handle errors silently
      revalidatePromise.catch(() => {
        // Silently handle revalidation errors
      });
    }
  }

  /**
   * Perform background revalidation
   * @param {RequestInfo | URL} input - Request input
   * @param {CachedFetchOptions} init - Fetch options
   * @param {Request} cacheKey - Cache key
   * @returns {Promise<void>}
   */
  private async performBackgroundRevalidation(
    input: RequestInfo | URL,
    init: CachedFetchOptions | undefined,
    cacheKey: Request,
  ): Promise<void> {
    try {
      const response = await this.performFetch(input, init);

      await this.cacheResponse(cacheKey, response, init);
    } finally {
      this.revalidationQueue.delete(cacheKey.url);
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
   * Cache the response using Cloudflare's Cache API
   * @param {Request} cacheKey - Cache key
   * @param {Response} response - Response to cache
   * @param {CachedFetchOptions} init - Fetch options
   * @returns {Promise<void>}
   */
  private async cacheResponse(
    cacheKey: Request,
    response: Response,
    init?: CachedFetchOptions,
  ): Promise<void> {
    // Only cache successful responses
    if (!response.ok) {
      return;
    }

    // Clone response and add cache headers
    const responseToCache = response.clone();
    const cacheHeaders = createCacheHeaders(init);

    // Add cache headers to the response
    cacheHeaders.forEach((value, key) => {
      responseToCache.headers.set(key, value);
    });

    // Add date header for age calculation
    responseToCache.headers.set('Date', new Date().toUTCString());

    try {
      // Use Cloudflare's cache.put method
      // Reference: https://developers.cloudflare.com/workers/runtime-apis/cache/
      await this.cache.put(cacheKey, responseToCache);
    } catch {
      // Cache put can fail for various reasons (size limits, etc.)
      // Silently handle cache errors to not break the request
    }
  }

  /**
   * Add cache status headers to response
   * @param {Response} response - Response to modify
   * @param {string} status - Cache status (HIT, MISS, STALE)
   * @returns {Response} Response with cache headers
   */
  private addCacheHeaders(response: Response, status: string): Response {
    const headers = new Headers(response.headers);

    headers.set('X-Cache-Status', status);

    if (status !== 'MISS') {
      const cacheDate = response.headers.get('date');

      if (cacheDate) {
        const age = Math.floor((Date.now() - new Date(cacheDate).getTime()) / 1000);

        headers.set('X-Cache-Age', age.toString());
      }
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }
}

// Create a singleton instance
const cloudflareCachedFetch = new CloudflareCachedFetch();

/**
 * Export the cached fetch function for Cloudflare Workers
 * @param {RequestInfo | URL} input - Request URL or Request object
 * @param {CachedFetchOptions} init - Fetch options with cache configuration
 * @param {CloudflareContext} ctx - Cloudflare Workers execution context
 * @returns {Promise<Response>} Cached or fresh response
 */
export const cachedFetch = (
  input: RequestInfo | URL,
  init?: CachedFetchOptions,
  ctx?: CloudflareContext,
): Promise<Response> => {
  return cloudflareCachedFetch.fetch(input, init, ctx);
};

// Export singleton instance for direct access
export { cloudflareCachedFetch };
