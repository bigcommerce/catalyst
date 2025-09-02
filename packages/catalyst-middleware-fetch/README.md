# @bigcommerce/catalyst-middleware-fetch

A router that selects the appropriate fetch implementation based on the hosting environment. Supports Vercel with `cached-middleware-fetch-next` and falls back to memory-cached fetch with LRU eviction for other environments.

## Features

- **Environment Detection**: Automatically detects Vercel environment using the `VERCEL` environment variable
- **Cached Fetch on Vercel**: Uses `cached-middleware-fetch-next` for optimized caching in Vercel environments
- **Memory-Cached Fetch Fallback**: Falls back to LRU memory-cached fetch for non-Vercel environments with background revalidation
- **Next.js Compatible**: Mirrors Next.js fetch API with `revalidate`, `cache`, and `next` options
- **Background Revalidation**: Uses `waitUntil` for non-blocking cache updates when available
- **Type Safe**: Full TypeScript support with proper type definitions
- **Universal API**: Provides a consistent fetch interface regardless of the underlying implementation

## Installation

```bash
npm install @bigcommerce/catalyst-middleware-fetch
```

## Usage

### Basic Usage

```typescript
import { createFetch, getEnvironmentInfo } from '@bigcommerce/catalyst-middleware-fetch';

// Get a fetch function that automatically selects the right implementation
const fetch = await createFetch();

// Use it like normal fetch with optional Next.js-style caching
const response = await fetch('https://api.example.com/data', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
  // Next.js-style caching options (works in all environments)
  next: {
    revalidate: 60, // Revalidate every 60 seconds
    tags: ['api-data'],
  },
});

const data = await response.json();
```

### Environment Information

```typescript
import { getEnvironmentInfo, isVercelEnvironment } from '@bigcommerce/catalyst-middleware-fetch';

// Check if running in Vercel
if (isVercelEnvironment()) {
  console.log('Running on Vercel with cached fetch');
}

// Get detailed environment information
const envInfo = await getEnvironmentInfo();
console.log(envInfo);
// Output: { 
//   isVercel: false, 
//   fetchImplementation: 'memory-cached-fetch',
//   environment: { VERCEL: undefined, NODE_ENV: 'development' }
// }
```

### Direct Implementation Access

```typescript
import { getFetchImplementation } from '@bigcommerce/catalyst-middleware-fetch';

// Get the implementation details
const implementation = await getFetchImplementation();
console.log(`Using: ${implementation.name}`);

// Use the fetch function directly
const response = await implementation.fetch('/api/data');
```

## API Reference

### Functions

- `createFetch()`: Returns a configured fetch function
- `getfetch()`: Alias for createFetch()
- `getFetchImplementation()`: Returns the fetch implementation with metadata
- `getDefaultFetch()`: Returns a cached fetch function (avoids re-initialization)
- `getEnvironmentInfo()`: Returns environment information for debugging
- `isVercelEnvironment()`: Checks if running in Vercel environment
- `resetCache()`: Resets cached implementations (useful for testing)
- `memoryCachedFetch`: Direct access to the memory cached fetch instance
- `MemoryCachedFetch`: Class for creating custom memory cached fetch instances

### Types

- `FetchFunction`: Standard fetch function type
- `FetchImplementation`: Implementation metadata with fetch function
- `CachedFetchOptions`: Extended options for cached fetch with Next.js-style options

### Memory Cache Options

The memory cached fetch supports the following Next.js-style options:

```typescript
const response = await fetch('/api/data', {
  cache: 'force-cache', // 'force-cache', 'no-store', or 'auto no cache'
  next: {
    revalidate: 300, // Revalidate every 5 minutes
    expires: 3600,   // Expire after 1 hour
    tags: ['user-data', 'profile'], // Cache tags for invalidation
  },
});
```

## Environment Support

| Environment | Implementation | Description |
|------------|----------------|-------------|
| Vercel | `cached-middleware-fetch-next` | Optimized caching for Vercel Edge Runtime |
| Other | `memory-cached-fetch` | LRU memory cache with background revalidation |

## Cache Mapping

Standard `RequestInit.cache` values are mapped to cache implementation values:

- `'no-store'` → `'no-store'` (always fetch from server)
- `'force-cache'` → `'force-cache'` (serve from cache if available, even if stale)
- All other values → `'auto no cache'` (cache but revalidate based on `next.revalidate`)

## Memory Cache Features

The memory cached fetch includes:

- **LRU Eviction**: Automatically removes old entries to prevent memory bloat
- **Background Revalidation**: Updates stale entries without blocking requests
- **Configurable TTL**: Set default cache lifetime (24 hours by default)
- **Cache Statistics**: Monitor cache hit/miss rates and size
- **Binary Content Support**: Handles images, videos, and other binary data
- **Compression Awareness**: Respects content-type for optimal storage