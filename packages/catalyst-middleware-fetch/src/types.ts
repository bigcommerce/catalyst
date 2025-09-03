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

/**
 * Storage adapter types
 */
export type StorageAdapter = 'memory' | 'vercel-runtime' | 'upstash' | 'cloudflare';

export interface StorageOptions {
  /**
   * Storage adapter to use
   */
  adapter?: StorageAdapter;
  /**
   * Base prefix for all cache keys
   */
  base?: string;
  /**
   * Default TTL for cache entries in seconds
   */
  ttl?: number;
  /**
   * Maximum number of entries for LRU cache (memory adapter only)
   */
  maxSize?: number;
  /**
   * Upstash Redis configuration (upstash adapter only)
   */
  upstash?: {
    url?: string;
    token?: string;
  };
  /**
   * Cloudflare context (cloudflare adapter only)
   */
  cloudflare?: {
    ctx?: {
      waitUntil(promise: Promise<unknown>): void;
      passThroughOnException(): void;
    };
  };
}

// Module will be imported dynamically, no need for module augmentation here

/**
 * Ensure Node.js process is available and waitUntil for background tasks
 */
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      VERCEL?: string;
      NODE_ENV?: string;
      WORKER_ENV?: string;
    }
  }

  /**
   * waitUntil function from Vercel Functions for background task processing
   */
  function waitUntil(promise: Promise<unknown>): void;
}

/**
 * Cloudflare Workers execution context
 */
export interface CloudflareContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

export {};
