/**
 * Generate a cache key for the fetch cache system.
 * This creates a consistent, scoped key for caching fetched data.
 *
 * @param key - The base key (e.g., pathname, API endpoint identifier)
 * @param scope - Optional scope (e.g., channelId, userId) to namespace the key
 * @returns A formatted cache key
 */
export function cacheKey(key: string, scope?: string): string {
  if (scope) {
    return `${scope}:${key}`;
  }
  return key;
}

// Common cache keys used throughout the application
export const STORE_STATUS_KEY = 'store-status';
export const ROUTE_KEY_PREFIX = 'route';

/**
 * Generate a route cache key.
 *
 * @param pathname - The route pathname
 * @param channelId - The channel ID for scoping
 * @returns A formatted route cache key
 */
export function routeCacheKey(pathname: string, channelId: string): string {
  return cacheKey(`${ROUTE_KEY_PREFIX}:${pathname}`, channelId);
}

/**
 * Generate a store status cache key.
 *
 * @param channelId - The channel ID for scoping
 * @returns A formatted store status cache key
 */
export function storeStatusCacheKey(channelId: string): string {
  return cacheKey(STORE_STATUS_KEY, channelId);
}
