/**
 * Custom Cloudflare Cache API driver for unstorage
 * Implements the unstorage driver interface using Cloudflare Workers Cache API
 */

import { defineDriver } from 'unstorage';
import type { Driver } from 'unstorage';

export interface CloudflareCacheDriverOptions {
  /**
   * Cache name to use (default: 'default')
   */
  cacheName?: string;
  /**
   * Base prefix for all keys
   */
  base?: string;
  /**
   * Default TTL for cache entries in seconds
   */
  ttl?: number;
  /**
   * Cloudflare context for waitUntil support
   */
  ctx?: {
    waitUntil(promise: Promise<unknown>): void;
    passThroughOnException(): void;
  };
}

/**
 * Generate a cache key URL for the Cloudflare Cache API
 */
function generateCacheKeyUrl(key: string, base?: string): string {
  const normalizedKey = base ? `${base}:${key}` : key;
  // Use a consistent base URL for cache keys
  return `https://cache.internal/${encodeURIComponent(normalizedKey)}`;
}

/**
 * Check if we're in a Cloudflare Workers environment
 */
function isCloudflareEnvironment(): boolean {
  return (
    typeof caches !== 'undefined' &&
    typeof (caches as unknown as { default?: Cache }).default !== 'undefined'
  );
}

/**
 * Create cache headers for TTL support
 */
function createCacheHeaders(ttl?: number): Headers {
  const headers = new Headers();
  
  if (ttl && ttl > 0) {
    headers.set('Cache-Control', `public, max-age=${ttl}, s-maxage=${ttl}`);
  } else {
    // Default to 1 hour if no TTL specified
    headers.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  }
  
  headers.set('Date', new Date().toUTCString());
  
  return headers;
}

/**
 * Check if a cached response is still valid
 */
function isCacheEntryValid(response: Response): boolean {
  const cacheControl = response.headers.get('cache-control');
  if (!cacheControl) return true;

  const maxAgeMatch = /max-age=(\d+)/.exec(cacheControl);
  if (!maxAgeMatch) return true;

  const maxAge = parseInt(maxAgeMatch[1], 10);
  const cacheDate = response.headers.get('date');
  if (!cacheDate) return true;

  const cachedTime = new Date(cacheDate).getTime();
  const now = Date.now();
  const age = (now - cachedTime) / 1000;

  return age < maxAge;
}

/**
 * Cloudflare Cache API driver for unstorage
 */
export default defineDriver((options: CloudflareCacheDriverOptions = {}): Driver => {
  const { cacheName = 'default', base, ttl, ctx } = options;
  
  let cache: Cache | null = null;
  
  // Initialize cache lazily
  const getCache = (): Cache => {
    if (!cache) {
      if (!isCloudflareEnvironment()) {
        throw new Error('Cloudflare Cache API is not available in this environment');
      }
      cache = (caches as unknown as { default: Cache }).default;
    }
    return cache;
  };

  return {
    name: 'cloudflare-cache',
    options,
    
    async hasItem(key: string): Promise<boolean> {
      try {
        const cacheKeyUrl = generateCacheKeyUrl(key, base);
        const request = new Request(cacheKeyUrl);
        const response = await getCache().match(request);
        
        if (!response) return false;
        
        return isCacheEntryValid(response);
      } catch {
        return false;
      }
    },

    async getItem(key: string): Promise<string | null> {
      try {
        const cacheKeyUrl = generateCacheKeyUrl(key, base);
        const request = new Request(cacheKeyUrl);
        const response = await getCache().match(request);
        
        if (!response || !isCacheEntryValid(response)) {
          return null;
        }
        
        const text = await response.text();
        
        // Try to parse as JSON, fallback to string
        try {
          return JSON.parse(text);
        } catch {
          return text;
        }
      } catch {
        return null;
      }
    },

    async setItem(key: string, value: string, opts?: { ttl?: number }): Promise<void> {
      try {
        const cacheKeyUrl = generateCacheKeyUrl(key, base);
        const request = new Request(cacheKeyUrl);
        
        // Serialize value
        const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
        
        // Create response with cache headers
        const headers = createCacheHeaders(opts?.ttl ?? ttl);
        const response = new Response(serializedValue, { headers });
        
        // Store in cache
        await getCache().put(request, response);
      } catch (error) {
        // Silently handle cache errors to not break the application
        console.warn('Failed to set item in Cloudflare cache:', error);
      }
    },

    async removeItem(key: string): Promise<void> {
      try {
        const cacheKeyUrl = generateCacheKeyUrl(key, base);
        const request = new Request(cacheKeyUrl);
        
        // Cloudflare Cache API doesn't have a direct delete method
        // We'll store an expired response to effectively remove it
        const headers = new Headers();
        headers.set('Cache-Control', 'public, max-age=0, s-maxage=0');
        headers.set('Date', new Date(Date.now() - 86400000).toUTCString()); // Yesterday
        
        const expiredResponse = new Response('', { headers });
        await getCache().put(request, expiredResponse);
      } catch (error) {
        // Silently handle cache errors
        console.warn('Failed to remove item from Cloudflare cache:', error);
      }
    },

    async getKeys(): Promise<string[]> {
      // Cloudflare Cache API doesn't support listing keys
      // Return empty array for compatibility
      return [];
    },

    async clear(): Promise<void> {
      // Cloudflare Cache API doesn't support clearing all entries
      // This is a no-op for compatibility
    },

    async dispose(): Promise<void> {
      cache = null;
    },

    // Watch is not supported by Cloudflare Cache API
    watch: undefined,
  };
});
