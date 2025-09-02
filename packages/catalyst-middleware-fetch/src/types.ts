/**
 * Type definitions for external modules and globals
 */

export interface CachedFetchOptions extends Omit<RequestInit, 'cache'> {
  cache?: 'auto no cache' | 'no-store' | 'force-cache';
  next?: {
    revalidate?: false | number;
    expires?: number;
    tags?: string[];
    fetchCacheKeyPrefix?: string;
  };
}

export interface CacheEntry {
  data: unknown;
  headers: Record<string, string>;
  status: number;
  statusText: string;
  timestamp: number;
  revalidateAfter?: number;
  expiresAt?: number;
  tags?: string[];
  isBinary?: boolean;
  contentType?: string;
}

// Module will be imported dynamically, no need for module augmentation here

/**
 * Ensure Node.js process is available
 */
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      VERCEL?: string;
      NODE_ENV?: string;
    }
  }
}

export {};
