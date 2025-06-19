import { FetchCacheAdapter, FetchCacheOptions } from '../types';

/**
 * Cloudflare native cache adapter that uses the Cache API available in Cloudflare Workers.
 * This demonstrates how platform-native caching can be used when available.
 *
 * Note: This is a future implementation for when running in Cloudflare Workers environment.
 * Cloudflare Workers provide a Cache API that can be used directly.
 */
export class CloudflareNativeFetchCacheAdapter implements FetchCacheAdapter {
  private cache?: Cache;

  private async getCache(): Promise<Cache> {
    if (!this.cache) {
      // In Cloudflare Workers, caches.default is available
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.cache = (globalThis as any).caches?.default;

      if (!this.cache) {
        throw new Error('Cloudflare Cache API not available');
      }
    }

    return this.cache;
  }

  private createCacheKey(key: string): string {
    // Create a valid cache key for the Cache API
    return `https://cache.internal/${encodeURIComponent(key)}`;
  }

  async get<T>(cacheKey: string): Promise<T | null> {
    try {
      const cache = await this.getCache();
      const cacheUrl = this.createCacheKey(cacheKey);

      const response = await cache.match(cacheUrl);

      if (!response) {
        return null;
      }

      const data = await response.json();
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return data as T;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`Cloudflare cache get failed for key ${cacheKey}:`, error);
      return null;
    }
  }

  async mget<T>(...cacheKeys: string[]): Promise<Array<T | null>> {
    // For now, implement mget as parallel get operations
    // Future optimization could use batch operations if available
    const results = await Promise.all(cacheKeys.map((key) => this.get<T>(key)));

    return results;
  }

  async set<T>(cacheKey: string, data: T, options: FetchCacheOptions = {}): Promise<T | null> {
    try {
      const cache = await this.getCache();
      const cacheUrl = this.createCacheKey(cacheKey);

      // Create headers with TTL information
      const headers = new Headers({
        'Content-Type': 'application/json',
      });

      // Add cache control headers for TTL
      if (options.ttl) {
        headers.set('Cache-Control', `max-age=${options.ttl}`);
      }

      // Create response to store in cache
      const response = new Response(JSON.stringify(data), { headers });

      await cache.put(cacheUrl, response);

      return data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`Cloudflare cache set failed for key ${cacheKey}:`, error);
      return null;
    }
  }
}
