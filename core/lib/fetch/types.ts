export interface FetchAdapterOptions {
  cache?: 'auto no cache' | 'no-store' | 'force-cache';
  next?: {
    revalidate?: false | 0 | number;
    expires?: number;
    tags?: string[];
    fetchCacheKeyPrefix?: string;
  };
}

export interface FetchAdapter {
  fetch(url: string | URL | Request, init?: RequestInit & FetchAdapterOptions): Promise<Response>;
}