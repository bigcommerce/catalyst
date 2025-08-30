import { FetchAdapter, FetchAdapterOptions } from '../types';

export class MemoryFetchAdapter implements FetchAdapter {
  async fetch(url: string | URL | Request, init?: RequestInit & FetchAdapterOptions): Promise<Response> {
    // For non-Vercel environments, just use regular fetch without caching
    // Remove the custom next options and convert cache options as they're not supported by regular fetch
    const { next, cache, ...cleanInit } = init || {};
    
    // Convert cache options to standard RequestCache if needed
    let requestCache: RequestCache | undefined;
    if (cache === 'no-store') {
      requestCache = 'no-store';
    } else if (cache === 'force-cache') {
      requestCache = 'force-cache';
    }
    
    return fetch(url, { ...cleanInit, cache: requestCache });
  }
}