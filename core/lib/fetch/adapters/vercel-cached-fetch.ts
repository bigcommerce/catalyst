import { cachedFetch, CachedFetchOptions } from 'cached-middleware-fetch-next';

import { FetchAdapter, FetchAdapterOptions } from '../types';

export class VercelCachedFetchAdapter implements FetchAdapter {
  async fetch(url: string | URL | Request, init?: RequestInit & FetchAdapterOptions): Promise<Response> {
    // Map our options to CachedFetchOptions
    const options: CachedFetchOptions = {
      ...init,
      cache: init?.cache as 'auto no cache' | 'no-store' | 'force-cache' | undefined,
      next: init?.next,
    };
    
    return cachedFetch(url, options);
  }
}