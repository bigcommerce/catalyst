import { NextFetchEvent } from 'next/server';

import { client } from '~/client';
import { fetch as cachedFetch, FetchAdapterOptions } from '~/lib/fetch';

interface MiddlewareClientOptions {
  event: NextFetchEvent;
}

/**
 * Middleware-specific client wrapper that uses cached fetch adapters
 * instead of relying on Next.js Data Cache which isn't available in middleware
 */
export function createMiddlewareClient(options: MiddlewareClientOptions) {
  // Create a custom fetch function that uses our adapter system
  const middlewareFetch = async (url: string | URL | Request, init?: RequestInit) => {
    // Extract Next.js specific cache options if they exist
    const fetchOptions = init as RequestInit & { next?: { revalidate?: number } };
    const revalidate = fetchOptions?.next?.revalidate;
    
    // Convert to our fetch adapter options
    const adapterOptions: RequestInit & FetchAdapterOptions = {
      ...init,
      next: revalidate !== undefined ? { revalidate } : undefined,
    };
    
    const response = await cachedFetch.fetch(url, adapterOptions);
    
    return response;
  };

  return {
    async fetch<TResult, TVariables = Record<string, never>>(params: {
      document: any;
      variables?: TVariables;
      channelId?: string;
      fetchOptions?: RequestInit & { next?: { revalidate?: number } };
    }) {
      // For middleware, we need to override the client's fetch behavior
      // We'll use our cached fetch system instead of the default client behavior
      
      // Create a temporary client with our custom fetch
      const originalFetch = global.fetch;
      
      try {
        // Override global fetch temporarily
        global.fetch = middlewareFetch as any;
        
        // Call the original client
        const result = await client.fetch(params);
        
        return result;
      } finally {
        // Restore original fetch
        global.fetch = originalFetch;
      }
    },
  };
}