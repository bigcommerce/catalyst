import { Redis } from '@upstash/redis';
import { createHash } from 'crypto';

import { FetchAdapter, FetchAdapterOptions } from '../types';

interface CachedResponse {
  data: string;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  timestamp: number;
}

export class UpstashCachedFetchAdapter implements FetchAdapter {
  private redis = Redis.fromEnv();

  async fetch(url: string | URL | Request, init?: RequestInit & FetchAdapterOptions): Promise<Response> {
    const cacheKey = this.generateCacheKey(url, init);
    const revalidate = init?.next?.revalidate ?? 3600; // Default 1 hour
    
    // If cache is disabled, fetch directly
    if (init?.cache === 'no-store' || revalidate === 0) {
      return this.fetchDirect(url, init);
    }

    try {
      // Try to get from cache first
      const cached = await this.redis.get<CachedResponse>(cacheKey);
      
      if (cached) {
        const age = Math.floor((Date.now() - cached.timestamp) / 1000);
        
        // If data is fresh, return it
        if (typeof revalidate === 'number' && age < revalidate) {
          return this.createResponseFromCache(cached, 'HIT', age);
        }
        
        // If data is stale but within expires window, return stale data
        const expires = init?.next?.expires ?? (typeof revalidate === 'number' ? revalidate * 2 : 7200);
        if (typeof expires === 'number' && age < expires) {
          // Background refresh (fire and forget)
          this.refreshInBackground(url, init, cacheKey);
          return this.createResponseFromCache(cached, 'STALE', age);
        }
      }
      
      // Cache miss or expired - fetch fresh data
      const response = await this.fetchDirect(url, init);
      
      // Cache the response for future use
      await this.cacheResponse(cacheKey, response, revalidate);
      
      return response;
    } catch (error) {
      // If Redis fails, fallback to direct fetch
      console.warn('Redis cache failed, falling back to direct fetch:', error);
      return this.fetchDirect(url, init);
    }
  }

  private async fetchDirect(url: string | URL | Request, init?: RequestInit & FetchAdapterOptions): Promise<Response> {
    const { next, ...cleanInit } = init || {};
    return fetch(url, cleanInit);
  }

  private generateCacheKey(url: string | URL | Request, init?: RequestInit & FetchAdapterOptions): string {
    const urlStr = typeof url === 'string' ? url : url.toString();
    const prefix = init?.next?.fetchCacheKeyPrefix || 'fetch';
    const body = init?.body ? createHash('sha256').update(init.body.toString()).digest('hex').slice(0, 16) : '';
    const method = init?.method || 'GET';
    
    return `${prefix}:${method}:${createHash('sha256').update(urlStr + body).digest('hex')}`;
  }

  private async cacheResponse(cacheKey: string, response: Response, ttl: false | 0 | number): Promise<void> {
    if (ttl === false) {
      // Cache indefinitely
      ttl = 31536000; // 1 year
    } else if (ttl === 0) {
      // Don't cache
      return;
    }
    
    try {
      // Clone the response to read the body without consuming the original
      const responseClone = response.clone();
      const body = await responseClone.text();
      
      const cached: CachedResponse = {
        data: body,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(Array.from(response.headers.entries())),
        timestamp: Date.now(),
      };
      
      await this.redis.setex(cacheKey, ttl || 3600, cached);
    } catch (error) {
      console.warn('Failed to cache response:', error);
    }
  }

  private createResponseFromCache(cached: CachedResponse, cacheStatus: string, age: number): Response {
    const headers = new Headers(cached.headers);
    headers.set('X-Cache-Status', cacheStatus);
    headers.set('X-Cache-Age', age.toString());
    
    return new Response(cached.data, {
      status: cached.status,
      statusText: cached.statusText,
      headers,
    });
  }

  private async refreshInBackground(url: string | URL | Request, init?: RequestInit & FetchAdapterOptions, cacheKey?: string): Promise<void> {
    try {
      const response = await this.fetchDirect(url, init);
      if (cacheKey) {
        const revalidate = init?.next?.revalidate ?? 3600;
        await this.cacheResponse(cacheKey, response, revalidate);
      }
    } catch (error) {
      console.warn('Background refresh failed:', error);
    }
  }
}