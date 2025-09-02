/**
 * Catalyst Middleware Fetch
 *
 * A router that selects the appropriate fetch implementation based on the hosting environment.
 * Supports Vercel with cached-middleware-fetch-next and falls back to standard fetch.
 */

import { type CachedFetchOptions } from './types';

/**
 * Environment detection utilities
 * @returns {boolean} True if running in Vercel environment
 */
export const isVercelEnvironment = (): boolean => {
  return process.env.VERCEL === '1';
};

/**
 * Type definitions for fetch implementations
 */
export type FetchFunction = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export interface FetchImplementation {
  fetch: FetchFunction;
  name: string;
}

/**
 * Cached fetch implementations to avoid repeated dynamic imports
 */
let cachedFetchImplementation: FetchImplementation | null = null;

/**
 * Map standard cache values to cached-middleware-fetch-next values
 * @param {RequestCache | undefined} cache - Standard cache value
 * @returns {'auto no cache' | 'no-store' | 'force-cache'} Mapped cache value
 */
const mapCacheValue = (
  cache: RequestCache | undefined,
): 'auto no cache' | 'no-store' | 'force-cache' => {
  if (cache === 'no-store') {
    return 'no-store';
  }

  if (cache === 'force-cache') {
    return 'force-cache';
  }

  return 'auto no cache';
};

/**
 * Get the appropriate fetch implementation based on the environment
 * @returns {Promise<FetchImplementation>} Promise resolving to the fetch implementation
 */
export const getFetchImplementation = async (): Promise<FetchImplementation> => {
  // Return cached implementation if available
  if (cachedFetchImplementation) {
    return cachedFetchImplementation;
  }

  let fetchImpl: FetchImplementation;

  if (isVercelEnvironment()) {
    try {
      // Dynamic import for Vercel environment
      const cachedModule = await import(
        /* webpackChunkName: "cached-middleware-fetch-next" */ 'cached-middleware-fetch-next'
      );
      const vercelFetch = cachedModule.fetch as (
        input: RequestInfo | URL,
        init?: CachedFetchOptions,
      ) => Promise<Response>;

      // Create a wrapper to normalize the interface to standard fetch
      const normalizedFetch: FetchFunction = (input: RequestInfo | URL, init?: RequestInit) => {
        // Convert standard RequestInit to CachedFetchOptions if needed
        const cachedInit: CachedFetchOptions | undefined = init
          ? {
              ...init,
              // Map standard cache values to cached-middleware-fetch-next values
              cache: mapCacheValue(init.cache),
            }
          : undefined;

        return vercelFetch(input, cachedInit);
      };

      fetchImpl = {
        fetch: normalizedFetch,
        name: 'cached-middleware-fetch-next',
      };
    } catch {
      // Fallback to standard fetch if cached-middleware-fetch-next fails to load
      fetchImpl = {
        fetch,
        name: 'standard-fetch-fallback',
      };
    }
  } else {
    // Use standard fetch for non-Vercel environments
    fetchImpl = {
      fetch,
      name: 'standard-fetch',
    };
  }

  // Cache the implementation
  cachedFetchImplementation = fetchImpl;

  return fetchImpl;
};

/**
 * Get the fetch function directly
 * @returns {Promise<FetchFunction>} Promise resolving to the fetch function
 */
export const getfetch = async (): Promise<FetchFunction> => {
  const implementation = await getFetchImplementation();

  return implementation.fetch;
};

/**
 * Create a configured fetch instance
 * This function returns a fetch implementation that can be used throughout the application
 * @returns {Promise<FetchFunction>} Promise resolving to the fetch function
 */
export const createFetch = async (): Promise<FetchFunction> => {
  return await getfetch();
};

/**
 * Environment information for debugging
 * @returns {Promise<object>} Promise resolving to environment information
 */
export const getEnvironmentInfo = async () => {
  const implementation = await getFetchImplementation();

  return {
    isVercel: isVercelEnvironment(),
    fetchImplementation: implementation.name,
    environment: {
      VERCEL: process.env.VERCEL,
      NODE_ENV: process.env.NODE_ENV,
    },
  };
};

// Export a default fetch function for convenience
let defaultFetch: FetchFunction | null = null;

/**
 * Get the default fetch implementation (cached)
 * @returns {Promise<FetchFunction>} Promise resolving to the cached fetch function
 */
export const getDefaultFetch = async (): Promise<FetchFunction> => {
  defaultFetch ??= await getfetch();

  return defaultFetch;
};

/**
 * Reset the cached implementations (useful for testing)
 * @returns {void} void
 */
export const resetCache = (): void => {
  cachedFetchImplementation = null;
  defaultFetch = null;
};
