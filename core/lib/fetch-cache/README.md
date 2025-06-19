# Fetch Cache System

A 2-layer caching system designed to work around Next.js middleware limitations where the normal `fetch()` Data Cache is not available.

## Overview

This system provides a drop-in replacement for data fetching in Next.js middleware with automatic TTL-based caching. It uses a memory-first approach with configurable backend storage.

## Architecture

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│   Request   │───▶│ Memory Cache │───▶│   Backend   │
└─────────────┘    └──────────────┘    │   Storage   │
                          │             └─────────────┘
                          ▼
                   ┌──────────────┐
                   │ Fresh Fetch  │
                   └──────────────┘
```

**2-Layer Strategy:**

1. **Memory Cache** (L1): Fast, in-memory LRU cache with TTL support
2. **Backend Storage** (L2): Persistent storage (Vercel Runtime Cache, Redis, etc.)

## Quick Start

### Basic Usage

```typescript
import { fetchWithTTLCache } from '~/lib/fetch-cache';

// Cache a single data fetch
const userData = await fetchWithTTLCache(
  async () => {
    const response = await fetch('/api/user/123');
    return response.json();
  },
  'user:123',
  { ttl: 300 }, // 5 minutes
);
```

### Batch Fetching

```typescript
import { batchFetchWithTTLCache } from '~/lib/fetch-cache';

// Cache multiple related fetches efficiently
const [route, status] = await batchFetchWithTTLCache([
  {
    fetcher: () => getRoute(pathname, channelId),
    cacheKey: routeCacheKey(pathname, channelId),
    options: { ttl: 86400 }, // 24 hours
  },
  {
    fetcher: () => getStoreStatus(channelId),
    cacheKey: storeStatusCacheKey(channelId),
    options: { ttl: 3600 }, // 1 hour
  },
]);
```

## Cache Key Management

```typescript
import { cacheKey, routeCacheKey, storeStatusCacheKey } from '~/lib/fetch-cache/keys';

// Generic cache key with optional scope
const key1 = cacheKey('user-profile', 'channel-123'); // → "channel-123:user-profile"

// Pre-built helpers for common use cases
const routeKey = routeCacheKey('/products', 'channel-123');
const statusKey = storeStatusCacheKey('channel-123');
```

## Backend Adapters

The system automatically detects the best available backend:

### 1. Cloudflare Workers (Future)

```typescript
// Automatically detected in Cloudflare Workers environment
// Uses native Cache API for optimal performance
```

### 2. Vercel Edge Runtime

```typescript
// Automatically detected when VERCEL=1
// Uses @vercel/functions getCache() API
```

### 3. Upstash Redis

```typescript
// Automatically detected when Redis env vars are present
// Requires: UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
```

### 4. Memory Only (Fallback)

```typescript
// Used when no other backend is available
// Memory cache only - no persistence
```

## Configuration

### Environment Variables

```bash
# Enable detailed logging (default: enabled in development)
FETCH_CACHE_LOGGER=true

# TTL configuration (in seconds)
ROUTE_CACHE_TTL=86400        # 24 hours
STORE_STATUS_CACHE_TTL=3600  # 1 hour

# Backend-specific configuration
VERCEL=1                                    # Auto-detected
UPSTASH_REDIS_REST_URL=https://...         # Redis backend
UPSTASH_REDIS_REST_TOKEN=...               # Redis backend
```

### Cache Options

```typescript
interface FetchCacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Cache tags for invalidation (backend dependent)
  [key: string]: unknown; // Additional backend-specific options
}
```

## Logging

When `FETCH_CACHE_LOGGER=true`, you'll see detailed operation logs:

```
[BigCommerce Fetch Cache] FETCH user:123 (Upstash Redis) - ✓ All from memory cache - Memory: 0.02ms, Total: 0.02ms
[BigCommerce Fetch Cache] BATCH_FETCH [route:/products, store-status] (Vercel Runtime Cache) - Memory: 1, Backend: 1 - Memory: 0.04ms, Backend: 1.23ms, Total: 1.27ms
[BigCommerce Fetch Cache] FETCH product:456 (Memory Only) - ✗ Fetch required: 1 - Backend: 45.67ms, Total: 45.71ms
```

**Log Format:**

- `✓` = Cache hit
- `✗` = Cache miss (fresh fetch required)
- Backend shows which storage system is being used
- Timing breakdown shows memory vs backend vs total time

## Examples

### Middleware Usage (Before/After)

**Before** (Complex manual cache management):

```typescript
// Complex cache logic spread across multiple functions
let [route, status] = await kv.mget(kvKey(pathname, channelId), kvKey(STORE_STATUS_KEY, channelId));

if (!status) {
  status = await fetchAndCacheStatus(channelId, event);
}

if (!route) {
  route = await fetchAndCacheRoute(pathname, channelId, event);
}
```

**After** (Clean, declarative):

```typescript
// Simple, declarative fetch with automatic caching
const [route, status] = await batchFetchWithTTLCache([
  {
    fetcher: () => getRoute(pathname, channelId),
    cacheKey: routeCacheKey(pathname, channelId),
    options: { ttl: ROUTE_CACHE_TTL },
  },
  {
    fetcher: () => getStoreStatus(channelId),
    cacheKey: storeStatusCacheKey(channelId),
    options: { ttl: STORE_STATUS_CACHE_TTL },
  },
]);
```

### Custom Cache Implementation

```typescript
import { fetchCache } from '~/lib/fetch-cache';

// Direct cache access (advanced usage)
const cachedData = await fetchCache.get<UserData>('user:123');

if (!cachedData) {
  const freshData = await fetchUserData('123');
  await fetchCache.set('user:123', freshData, { ttl: 300 });
}
```

## Performance Benefits

- **Memory First**: Sub-millisecond cache hits for frequently accessed data
- **Batch Operations**: Optimized multi-key fetching reduces round trips
- **Platform Native**: Uses the best caching available for each environment
- **Fire-and-Forget**: Cache updates don't block the response
- **TTL Management**: Automatic expiration handling

## Migration Guide

### From Direct KV Usage

```typescript
// Old KV approach
import { kv } from '~/lib/kv';
const data = await kv.get('key');
if (!data) {
  const fresh = await fetchData();
  await kv.set('key', fresh, { ttl: 300 });
}

// New fetch cache approach
import { fetchWithTTLCache } from '~/lib/fetch-cache';
const data = await fetchWithTTLCache(() => fetchData(), 'key', { ttl: 300 });
```

### From Manual Cache Management

The new system eliminates the need for manual cache checking, setting, and TTL management. Just wrap your data fetching function with `fetchWithTTLCache()` and the caching is handled automatically.

## Extending the System

### Adding New Backends

```typescript
// Example: Custom database cache adapter
export class DatabaseCacheAdapter implements FetchCacheAdapter {
  async get<T>(cacheKey: string): Promise<T | null> {
    // Implement database get logic
  }

  async set<T>(cacheKey: string, data: T, options?: FetchCacheOptions): Promise<T | null> {
    // Implement database set logic with TTL
  }

  async mget<T>(...cacheKeys: string[]): Promise<Array<T | null>> {
    // Implement batch get logic
  }
}
```

Then add detection logic to `createFetchCacheAdapter()` in `index.ts`.

## Troubleshooting

### Cache Not Working

1. Check if backend is properly configured (env vars)
2. Enable logging with `FETCH_CACHE_LOGGER=true`
3. Verify cache keys are consistent between set/get operations

### Performance Issues

1. Use batch fetching for multiple related operations
2. Choose appropriate TTL values (too short = frequent fetches, too long = stale data)
3. Monitor memory usage if using memory-only mode

### Backend-Specific Issues

**Vercel Runtime Cache:**

- Only works in Vercel Edge Runtime
- Limited to 1MB per key
- Automatic cleanup based on usage

**Upstash Redis:**

- Check network connectivity
- Verify authentication tokens
- Monitor Redis memory usage

**Memory Only:**

- Limited by available memory
- No persistence across restarts
- Consider LRU cache size (default: 500 items)
