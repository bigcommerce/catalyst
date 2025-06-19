export interface FetchCacheOptions {
  /** Time to live in seconds */
  ttl?: number;
  /** Cache tags for invalidation (when supported by backend) */
  tags?: string[];
  /** Additional backend-specific options */
  [key: string]: unknown;
}

export interface FetchCacheAdapter {
  get<T>(cacheKey: string): Promise<T | null>;
  set<T>(cacheKey: string, data: T, options?: FetchCacheOptions): Promise<T | null>;
  mget<T>(...cacheKeys: string[]): Promise<Array<T | null>>;
}

export interface FetchCacheResult<T> {
  data: T;
  fromCache: boolean;
  cacheSource?: 'memory' | 'backend';
}
