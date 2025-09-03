# Catalyst Middleware Fetch

A custom fetch implementation powered by [unstorage](https://unstorage.unjs.io/) that provides caching for API calls from Next.js middleware across different hosting environments. Automatically selects the best storage adapter based on your deployment environment.

## Features

- 🚀 **Automatic Environment Detection**: Detects Vercel, Cloudflare Workers, Upstash, or falls back to memory cache
- 🔄 **Background Revalidation**: Serves stale content while revalidating in the background
- 🎯 **Multiple Storage Adapters**: LRU memory cache, Vercel Runtime Cache, Upstash Redis, Cloudflare Cache API
- 📦 **Dynamic Imports**: Only loads the storage driver needed for your environment
- 🔧 **Next.js Compatible**: Supports Next.js cache configuration (`revalidate`, `tags`, etc.)

## Installation

```bash
npm install @bigcommerce/catalyst-middleware-fetch
# or
pnpm install @bigcommerce/catalyst-middleware-fetch
```

## Quick Start

```typescript
import { cachedFetch } from '@bigcommerce/catalyst-middleware-fetch';

// Simple usage - automatically detects environment and uses appropriate storage
const response = await cachedFetch('https://api.example.com/data');

// With Next.js-style cache configuration
const response = await cachedFetch('https://api.example.com/data', {
  next: {
    revalidate: 60, // Revalidate after 60 seconds
    tags: ['user-data'], // Cache tags for invalidation
  }
});
```

## Storage Adapters

### 1. Memory Cache (Default/Fallback)
Uses LRU cache for in-memory storage.

```typescript
import { createFetch } from '@bigcommerce/catalyst-middleware-fetch';

const fetch = await createFetch({
  adapter: 'memory',
  maxSize: 1000, // Maximum number of entries
  ttl: 3600, // TTL in seconds
});
```

### 2. Vercel Runtime Cache
Uses Vercel's Runtime Cache API for serverless functions.

```typescript
const fetch = await createFetch({
  adapter: 'vercel-runtime',
  ttl: 3600,
  base: 'my-app', // Optional namespace
});
```

### 3. Upstash Redis
Uses Upstash Redis for distributed caching.

```typescript
const fetch = await createFetch({
  adapter: 'upstash',
  upstash: {
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  },
  ttl: 3600,
});
```

### 4. Cloudflare Cache API
Uses Cloudflare Workers Cache API.

```typescript
const fetch = await createFetch({
  adapter: 'cloudflare',
  cloudflare: {
    ctx: context, // Cloudflare Workers context for waitUntil support
  },
  ttl: 3600,
});
```

## Environment Detection

The library automatically detects your environment:

- **Vercel**: Checks for `process.env.VERCEL === '1'`
- **Upstash**: Checks for `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
- **Cloudflare Workers**: Checks for `caches.default` availability
- **Memory**: Fallback for all other environments

```typescript
import { detectStorageAdapter, getEnvironmentInfo } from '@bigcommerce/catalyst-middleware-fetch';

console.log('Detected adapter:', detectStorageAdapter());
console.log('Environment info:', await getEnvironmentInfo());
```

## Advanced Usage

### Custom Storage Configuration

```typescript
import { createFetch } from '@bigcommerce/catalyst-middleware-fetch';

const fetch = await createFetch({
  adapter: 'memory',
  base: 'api-cache', // Namespace for cache keys
  ttl: 1800, // 30 minutes TTL
  maxSize: 500, // Max entries for LRU cache
});

const response = await fetch.fetch('https://api.example.com/data', {
  next: {
    revalidate: 60, // Background revalidation after 60s
    tags: ['api-data'],
  }
});
```

### Cache Control

```typescript
// Force cache (serve stale if available)
await cachedFetch(url, { cache: 'force-cache' });

// No store (bypass cache completely)
await cachedFetch(url, { cache: 'no-store' });

// Auto (default behavior)
await cachedFetch(url, { cache: 'auto no cache' });
```

### Background Revalidation

The library supports background revalidation similar to Next.js:

```typescript
await cachedFetch(url, {
  next: {
    revalidate: 60, // Serve from cache, revalidate after 60 seconds
    tags: ['user-data'], // Tags for selective cache invalidation
  }
});
```

### Working with Cloudflare Workers

```typescript
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const fetch = await createFetch({
      adapter: 'cloudflare',
      cloudflare: {
        ctx, // Pass context for waitUntil support
      },
    });

    return fetch.fetch('https://api.example.com/data');
  },
};
```

## API Reference

### `cachedFetch(input, init?, options?)`

Convenience function using the default fetch instance.

- `input`: URL or Request object
- `init`: RequestInit with cache options
- `options`: Storage configuration options

### `createFetch(options?)`

Creates a new fetch instance with custom storage configuration.

### `CatalystFetch`

Main class for cached fetch operations.

```typescript
import { CatalystFetch, createCacheStorage } from '@bigcommerce/catalyst-middleware-fetch';

const storage = await createCacheStorage({ adapter: 'memory' });
const fetch = new CatalystFetch(storage);
```

### Environment Detection Functions

- `isVercelEnvironment()`: Check if running on Vercel
- `isCloudflareEnvironment()`: Check if running on Cloudflare Workers  
- `isUpstashEnvironment()`: Check if Upstash credentials are available
- `detectStorageAdapter()`: Get the best adapter for current environment

## Migration from Previous Version

The new version is powered by unstorage and provides a cleaner API:

```typescript
// Old way
import { getfetch } from '@bigcommerce/catalyst-middleware-fetch';
const fetch = await getfetch();

// New way
import { cachedFetch } from '@bigcommerce/catalyst-middleware-fetch';
// or
import { getDefaultFetch } from '@bigcommerce/catalyst-middleware-fetch';
const fetch = await getDefaultFetch();
```

## Extending with Additional Storage Adapters

The library is built on [unstorage](https://unstorage.unjs.io/), which supports many additional storage adapters. You can easily extend the library to use other storage backends.

### Adding Redis Support

To add Redis support using unstorage's Redis driver:

1. **Install the Redis driver**:
```bash
npm install @upstash/redis
# or for standard Redis
npm install ioredis
```

2. **Extend the storage creation function**:
```typescript
import { createStorage } from 'unstorage';
import redisDriver from 'unstorage/drivers/redis';
import { CatalystFetch } from '@bigcommerce/catalyst-middleware-fetch';

// Create a custom function that includes Redis
async function createCustomCacheStorage(adapter: string, options: any) {
  if (adapter === 'redis') {
    return createStorage({
      driver: redisDriver({
        host: options.redis?.host || 'localhost',
        port: options.redis?.port || 6379,
        password: options.redis?.password,
        db: options.redis?.db || 0,
        ttl: options.ttl,
        base: options.base,
      }),
    });
  }
  
  // Fall back to the built-in adapters
  const { createCacheStorage } = await import('@bigcommerce/catalyst-middleware-fetch');
  return createCacheStorage({ adapter, ...options });
}

// Usage
const storage = await createCustomCacheStorage('redis', {
  redis: {
    host: 'your-redis-host.com',
    port: 6379,
    password: 'your-password',
  },
  ttl: 3600,
});

const fetch = new CatalystFetch(storage);
```

### Other Available Drivers

Unstorage supports many other drivers that you can integrate:

- **File System**: `unstorage/drivers/fs`
- **MongoDB**: `unstorage/drivers/mongodb`  
- **Planetscale**: `unstorage/drivers/planetscale`
- **Azure**: `unstorage/drivers/azure-*`
- **GitHub**: `unstorage/drivers/github`
- **HTTP**: `unstorage/drivers/http`

### Example: Adding File System Cache

```typescript
import { createStorage } from 'unstorage';
import fsDriver from 'unstorage/drivers/fs';
import { CatalystFetch } from '@bigcommerce/catalyst-middleware-fetch';

const storage = createStorage({
  driver: fsDriver({
    base: './cache', // Directory to store cache files
  }),
});

const fetch = new CatalystFetch(storage);
```

### Creating a Custom Adapter Factory

For a more integrated approach, you can create a factory function:

```typescript
import { createStorage } from 'unstorage';
import type { Storage } from 'unstorage';

export type ExtendedStorageAdapter = 
  | 'memory' 
  | 'vercel-runtime' 
  | 'upstash' 
  | 'cloudflare'
  | 'redis'
  | 'filesystem'
  | 'mongodb';

export async function createExtendedCacheStorage(
  adapter: ExtendedStorageAdapter,
  options: any = {}
): Promise<Storage> {
  switch (adapter) {
    case 'redis': {
      const { default: redisDriver } = await import('unstorage/drivers/redis');
      return createStorage({
        driver: redisDriver({
          host: options.redis?.host || 'localhost',
          port: options.redis?.port || 6379,
          password: options.redis?.password,
          ttl: options.ttl,
          base: options.base,
        }),
      });
    }
    
    case 'filesystem': {
      const { default: fsDriver } = await import('unstorage/drivers/fs');
      return createStorage({
        driver: fsDriver({
          base: options.fsPath || './cache',
        }),
      });
    }
    
    case 'mongodb': {
      const { default: mongoDriver } = await import('unstorage/drivers/mongodb');
      return createStorage({
        driver: mongoDriver({
          connectionString: options.mongodb?.connectionString,
          databaseName: options.mongodb?.databaseName || 'cache',
          collectionName: options.mongodb?.collectionName || 'storage',
        }),
      });
    }
    
    default: {
      // Fall back to built-in adapters
      const { createCacheStorage } = await import('@bigcommerce/catalyst-middleware-fetch');
      return createCacheStorage({ adapter, ...options });
    }
  }
}
```

### Environment Detection for Custom Adapters

You can also extend the environment detection:

```typescript
import { detectStorageAdapter } from '@bigcommerce/catalyst-middleware-fetch';

export function detectExtendedStorageAdapter(): ExtendedStorageAdapter {
  // Check for Redis environment variables
  if (process.env.REDIS_HOST || process.env.REDIS_URL) {
    return 'redis';
  }
  
  // Check for MongoDB connection string
  if (process.env.MONGODB_URI) {
    return 'mongodb';
  }
  
  // Fall back to built-in detection
  return detectStorageAdapter();
}
```

For more information on available drivers and their configuration options, see the [unstorage drivers documentation](https://unstorage.unjs.io/drivers).

## License

MIT