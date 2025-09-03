/**
 * Example: Extending Catalyst Middleware Fetch with Redis Support
 * 
 * This example shows how customers can extend the library to support
 * additional unstorage drivers like Redis, MongoDB, filesystem, etc.
 */

import { createStorage } from 'unstorage';
import type { Storage } from 'unstorage';
import { 
  CatalystFetch, 
  createCacheStorage, 
  detectStorageAdapter,
  type StorageAdapter 
} from '@bigcommerce/catalyst-middleware-fetch';

// Extend the base storage adapter type
export type ExtendedStorageAdapter = 
  | StorageAdapter 
  | 'redis' 
  | 'filesystem' 
  | 'mongodb';

// Extended storage options interface
export interface ExtendedStorageOptions {
  adapter?: ExtendedStorageAdapter;
  base?: string;
  ttl?: number;
  maxSize?: number;
  // Redis-specific options
  redis?: {
    host?: string;
    port?: number;
    password?: string;
    db?: number;
    url?: string; // Alternative to host/port
  };
  // Filesystem-specific options
  filesystem?: {
    base?: string;
  };
  // MongoDB-specific options
  mongodb?: {
    connectionString?: string;
    databaseName?: string;
    collectionName?: string;
  };
  // Keep existing options for compatibility
  upstash?: {
    url?: string;
    token?: string;
  };
  cloudflare?: {
    ctx?: {
      waitUntil(promise: Promise<unknown>): void;
      passThroughOnException(): void;
    };
  };
}

/**
 * Extended environment detection that includes Redis and other adapters
 */
export function detectExtendedStorageAdapter(): ExtendedStorageAdapter {
  // Check for Redis environment variables
  if (process.env.REDIS_HOST || process.env.REDIS_URL) {
    return 'redis';
  }
  
  // Check for MongoDB connection string
  if (process.env.MONGODB_URI || process.env.MONGODB_CONNECTION_STRING) {
    return 'mongodb';
  }
  
  // Check if we're in a filesystem-friendly environment
  if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
    // Could use filesystem cache for development
    // return 'filesystem';
  }
  
  // Fall back to built-in detection
  return detectStorageAdapter();
}

/**
 * Extended storage factory that supports additional drivers
 */
export async function createExtendedCacheStorage(
  options: ExtendedStorageOptions = {}
): Promise<Storage> {
  const adapter = options.adapter ?? detectExtendedStorageAdapter();

  switch (adapter) {
    case 'redis': {
      // Dynamic import to avoid bundling Redis driver unless needed
      const { default: redisDriver } = await import('unstorage/drivers/redis');
      
      return createStorage({
        driver: redisDriver({
          // Support both URL-based and individual parameter configuration
          ...(options.redis?.url 
            ? { url: options.redis.url }
            : {
                host: options.redis?.host || process.env.REDIS_HOST || 'localhost',
                port: options.redis?.port || parseInt(process.env.REDIS_PORT || '6379', 10),
                password: options.redis?.password || process.env.REDIS_PASSWORD,
                db: options.redis?.db || parseInt(process.env.REDIS_DB || '0', 10),
              }
          ),
          ttl: options.ttl,
          base: options.base,
        }),
      });
    }
    
    case 'filesystem': {
      const { default: fsDriver } = await import('unstorage/drivers/fs');
      
      return createStorage({
        driver: fsDriver({
          base: options.filesystem?.base || './cache',
        }),
      });
    }
    
    case 'mongodb': {
      const { default: mongoDriver } = await import('unstorage/drivers/mongodb');
      
      return createStorage({
        driver: mongoDriver({
          connectionString: 
            options.mongodb?.connectionString || 
            process.env.MONGODB_URI || 
            process.env.MONGODB_CONNECTION_STRING,
          databaseName: options.mongodb?.databaseName || 'cache',
          collectionName: options.mongodb?.collectionName || 'storage',
        }),
      });
    }
    
    default: {
      // Fall back to built-in adapters for memory, vercel-runtime, upstash, cloudflare
      return createCacheStorage(options);
    }
  }
}

/**
 * Extended fetch creation function
 */
export async function createExtendedFetch(
  options?: ExtendedStorageOptions
): Promise<CatalystFetch> {
  const storage = await createExtendedCacheStorage(options);
  return new CatalystFetch(storage);
}

// Example usage functions

/**
 * Example: Create fetch with Redis cache
 */
export async function createRedisCachedFetch() {
  return createExtendedFetch({
    adapter: 'redis',
    redis: {
      host: 'localhost',
      port: 6379,
      // password: 'your-password',
      db: 0,
    },
    ttl: 3600, // 1 hour TTL
  });
}

/**
 * Example: Create fetch with filesystem cache (useful for development)
 */
export async function createFileSystemCachedFetch() {
  return createExtendedFetch({
    adapter: 'filesystem',
    filesystem: {
      base: './cache',
    },
  });
}

/**
 * Example: Create fetch with MongoDB cache
 */
export async function createMongoCachedFetch() {
  return createExtendedFetch({
    adapter: 'mongodb',
    mongodb: {
      connectionString: 'mongodb://localhost:27017/myapp',
      databaseName: 'cache',
      collectionName: 'http_cache',
    },
  });
}

/**
 * Example: Auto-detect extended environment and create fetch
 */
export async function createAutoExtendedFetch(): Promise<CatalystFetch> {
  const adapter = detectExtendedStorageAdapter();
  console.log(`Using storage adapter: ${adapter}`);
  
  return createExtendedFetch({
    adapter,
    ttl: 3600,
  });
}

// Example usage in an application:
/*
async function exampleUsage() {
  // Option 1: Use Redis if available
  const redisFetch = await createRedisCachedFetch();
  const response1 = await redisFetch.fetch('https://api.example.com/data');

  // Option 2: Auto-detect best adapter
  const autoFetch = await createAutoExtendedFetch();
  const response2 = await autoFetch.fetch('https://api.example.com/users');

  // Option 3: Use filesystem for development
  const fsFetch = await createFileSystemCachedFetch();
  const response3 = await fsFetch.fetch('https://api.example.com/posts');
}
*/
