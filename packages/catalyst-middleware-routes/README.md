# @bigcommerce/catalyst-middleware-routes

BigCommerce Catalyst middleware for handling dynamic routing and redirects. This package abstracts the complexity of BigCommerce route resolution, redirects, and caching into a simple, configurable middleware.

## Features

- 🚀 **Simple Integration**: Single import replaces complex middleware logic
- ⚙️ **Configurable Route Mappings**: Customize how GraphQL node types map to internal routes
- 🔄 **Intelligent Redirects**: Handle BigCommerce redirects with configurable behavior
- 💾 **Built-in Caching**: KV-based caching with memory fallback and SWR-like behavior
- 🛡️ **Route Exemptions**: Exclude specific routes from middleware processing
- 📊 **Analytics Integration**: Optional product visit tracking
- 🎯 **Strong Defaults**: Works out-of-the-box with sensible configurations

## Installation

```bash
pnpm add @bigcommerce/catalyst-middleware-routes
```

## Quick Start

Replace your existing `withRoutes` middleware with the new abstracted version:

```typescript
// middleware.ts
import { createRoutesMiddleware } from '@bigcommerce/catalyst-middleware-routes';
import { client } from '~/client';
import { composeMiddlewares } from './middlewares/compose-middlewares';
// ... other imports

const withRoutes = createRoutesMiddleware({
  client, // Only the client is required!
});

export const middleware = composeMiddlewares(
  withAuth,
  withIntl,
  withAnalyticsCookies,
  withChannelId,
  withRoutes,
);
```

## Configuration Options

### Basic Configuration

```typescript
const withRoutes = createRoutesMiddleware({
  client: bigCommerceClient,        // Required: BigCommerce GraphQL client
  kvAdapter?: kvAdapter,            // Optional: Custom KV adapter (defaults to memory)
});
```

### Route Mappings

Customize how GraphQL node types map to internal route URLs:

```typescript
const withRoutes = createRoutesMiddleware({
  client,
  routeMappings: {
    Product: {
      pathTemplate: '/${locale}/products/${entityId}',  // Custom product path
      recordAnalytics: true,                            // Enable analytics
    },
    Category: {
      pathTemplate: '/${locale}/categories/${entityId}',
      recordAnalytics: false,
    },
    Brand: {
      pathTemplate: '/${locale}/brands/${entityId}',
    },
    // Override other node types as needed
  },
});
```

### Route Exemptions

Exempt specific top-level routes from middleware processing:

```typescript
const withRoutes = createRoutesMiddleware({
  client,
  exemptRoutes: [
    '/api',           // Exempt all /api routes
    '/custom-app',    // Exempt /custom-app and sub-routes
    '/admin/*',       // Exempt with wildcard pattern
  ],
});
```

### Redirect Configuration

Configure redirect behavior:

```typescript
const withRoutes = createRoutesMiddleware({
  client,
  redirects: {
    enabled: true,                    // Enable/disable redirects
    statusCode: 301,                  // HTTP status code (301, 302, 307, 308)
    preserveTrailingSlash: true,      // Preserve trailing slashes
  },
});
```

### Analytics Configuration

Control product visit tracking:

```typescript
const withRoutes = createRoutesMiddleware({
  client,
  analytics: {
    enabled: false,                   // Disable analytics tracking
  },
});
```

### Cache Configuration

Customize caching behavior:

```typescript
const withRoutes = createRoutesMiddleware({
  client,
  cache: {
    routeCacheTtl: 30 * 60 * 1000,    // Route cache TTL (30 minutes)
    statusCacheTtl: 5 * 60 * 1000,    // Store status cache TTL (5 minutes)
  },
});
```

## Default Route Mappings

The middleware includes sensible defaults for all BigCommerce node types:

| Node Type | Default Path Template |
|-----------|----------------------|
| Product | `/${locale}/product/${entityId}` |
| Category | `/${locale}/category/${entityId}` |
| Brand | `/${locale}/brand/${entityId}` |
| Blog | `/${locale}/blog` |
| BlogPost | `/${locale}/blog/${entityId}` |
| NormalPage | `/${locale}/webpages/${id}/normal/` |
| ContactPage | `/${locale}/webpages/${id}/contact/` |

## KV Adapters

The middleware supports various KV storage backends:

### Memory Adapter (Default)
```typescript
import { MemoryKVAdapter } from '@bigcommerce/catalyst-middleware-routes';

const kvAdapter = new MemoryKVAdapter();
```

### Custom KV Adapter
```typescript
const customKvAdapter = {
  async get<Data>(key: string): Promise<Data | null> {
    // Your implementation
  },
  async mget<Data>(...keys: string[]): Promise<(Data | null)[]> {
    // Your implementation
  },
  async set<Data>(key: string, value: Data, opts?: { ttl?: number }): Promise<Data> {
    // Your implementation
  },
};
```

## Migration from Core Middleware

If you're migrating from the existing core `withRoutes` middleware:

1. **Install the package**: `pnpm add @bigcommerce/catalyst-middleware-routes`

2. **Create KV adapter** (optional, for custom caching):
```typescript
// lib/middleware-helpers.ts
export const kvAdapter = {
  // Your KV adapter implementation
};
```

3. **Update middleware.ts**:
```typescript
import { createRoutesMiddleware } from '@bigcommerce/catalyst-middleware-routes';
import { kvAdapter } from './lib/middleware-helpers'; // Optional

const withRoutes = createRoutesMiddleware({
  client,
  kvAdapter, // Optional - defaults to memory caching
});
```

4. **Remove the old middleware**: Delete `middlewares/with-routes.ts`

**That's it!** Analytics, raw page handling, and all routing logic are now built-in.

## API Reference

### Types

```typescript
interface RoutesMiddlewareConfig {
  client: any;                           // BigCommerce GraphQL client (REQUIRED)
  kvAdapter?: KVAdapter;                 // Custom KV storage adapter (optional)
  routeMappings?: RouteMappings;         // Custom route mappings (optional)
  redirects?: Partial<RedirectConfig>;   // Redirect configuration (optional)
  cache?: Partial<CacheConfig>;          // Cache configuration (optional)
  analytics?: Partial<AnalyticsConfig>; // Analytics configuration (optional)
  exemptRoutes?: string[];               // Routes to exempt from processing (optional)
}
```

### Functions

- **`createRoutesMiddleware(config: RoutesMiddlewareConfig)`**: Creates a configured middleware factory
- **`RoutesMiddleware`**: Core middleware class for advanced usage
- **`MemoryKVAdapter`**: In-memory KV storage adapter
- **`KVWithMemoryFallback`**: KV adapter with automatic memory caching

## License

MIT