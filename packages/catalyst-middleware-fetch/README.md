# @bigcommerce/catalyst-middleware-fetch

A router that selects the appropriate fetch implementation based on the hosting environment. Supports Vercel with `cached-middleware-fetch-next` and falls back to standard fetch for other environments.

## Features

- **Environment Detection**: Automatically detects Vercel environment using the `VERCEL` environment variable
- **Cached Fetch on Vercel**: Uses `cached-middleware-fetch-next` for optimized caching in Vercel environments
- **Standard Fetch Fallback**: Falls back to standard fetch for non-Vercel environments
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

// Use it like normal fetch
const response = await fetch('https://api.example.com/data', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
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
//   isVercel: true, 
//   fetchImplementation: 'cached-middleware-fetch-next',
//   environment: { VERCEL: '1', NODE_ENV: 'production' }
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

### Types

- `FetchFunction`: Standard fetch function type
- `FetchImplementation`: Implementation metadata with fetch function
- `CachedFetchOptions`: Extended options for cached fetch (when using Vercel)

## Environment Support

| Environment | Implementation | Description |
|------------|----------------|-------------|
| Vercel | `cached-middleware-fetch-next` | Optimized caching for Vercel Edge Runtime |
| Other | Standard `fetch` | Uses global fetch implementation |

## Cache Mapping

When running on Vercel, standard `RequestInit.cache` values are mapped to `cached-middleware-fetch-next` values:

- `'no-store'` → `'no-store'`
- `'force-cache'` → `'force-cache'` 
- All other values → `'auto no cache'`