# @bigcommerce/catalyst-sitemap

A reusable sitemap route handler for BigCommerce Catalyst applications.

## Installation

```bash
npm install @bigcommerce/catalyst-sitemap
```

## Usage

This package provides a configurable sitemap route handler that can be easily integrated into any Next.js App Router application.

### Basic Usage

```typescript
// app/sitemap.xml/route.ts
import { createSitemapHandler } from '@bigcommerce/catalyst-sitemap';
import { client } from '~/client'; // Your BigCommerce client
import { getChannelIdFromLocale } from '~/channels.config';
import { defaultLocale } from '~/i18n/locales';

export const GET = createSitemapHandler({
  client,
  getChannelId: async () => {
    return getChannelIdFromLocale(defaultLocale);
  },
});
```

### Advanced Configuration

```typescript
// app/sitemap.xml/route.ts
import { createSitemapHandler } from '@bigcommerce/catalyst-sitemap';
import { client } from '~/client';

export const GET = createSitemapHandler({
  client,
  getChannelId: async (request) => {
    // Extract channel ID from request context, headers, etc.
    const locale = request?.headers.get('accept-language');
    return getChannelIdFromLocale(locale) ?? 'default-channel-id';
  },
  hostname: 'example.com', // Optional: override hostname
  protocol: 'https', // Optional: override protocol
});
```

### Environment-specific Configuration

```typescript
// app/sitemap.xml/route.ts
import { createSitemapHandler } from '@bigcommerce/catalyst-sitemap';
import { createClient } from '@bigcommerce/catalyst-client';

// Create client with environment-specific configuration
const client = createClient({
  storeHash: process.env.BIGCOMMERCE_STORE_HASH!,
  storefrontToken: process.env.BIGCOMMERCE_STOREFRONT_TOKEN!,
  channelId: process.env.BIGCOMMERCE_CHANNEL_ID,
});

export const GET = createSitemapHandler({
  client,
  getChannelId: async () => process.env.BIGCOMMERCE_CHANNEL_ID!,
  hostname: process.env.PUBLIC_HOSTNAME,
  protocol: process.env.NODE_ENV === 'production' ? 'https' : 'http',
});
```

## Configuration

### SitemapConfig

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `client` | `BigCommerceClient` | Yes | Configured BigCommerce client instance |
| `getChannelId` | `(request?: Request) => Promise<string> \| string` | Yes | Function to determine channel ID for the request |
| `hostname` | `string` | No | Override hostname for sitemap URLs (defaults to request host) |
| `protocol` | `'http' \| 'https'` | No | Override protocol for sitemap URLs (defaults to request protocol) |

## Features

- **Sitemap Index**: Serves the main sitemap index from BigCommerce
- **Individual Sitemaps**: Handles individual sitemap requests with `type` and `page` parameters
- **URL Normalization**: Rewrites BigCommerce sitemap URLs to use your application's hostname and protocol
- **Error Handling**: Validates required parameters and handles upstream errors gracefully
- **Configurable**: Accepts configuration for different environments and use cases
- **Framework Agnostic**: Works with any environment that supports Web API Request/Response

## How it Works

1. The handler checks if specific sitemap parameters (`type` and `page`) are provided
2. If both parameters are present, it fetches the specific sitemap from BigCommerce
3. If no parameters are provided, it fetches the sitemap index and rewrites internal URLs to match your domain
4. All responses are returned with proper XML content-type headers

## Migration from Built-in Route

If you're migrating from a built-in sitemap route, the process is straightforward:

**Before:**
```typescript
// app/sitemap.xml/route.ts
export const GET = async (request: Request) => {
  // 70+ lines of sitemap handling logic
};
```

**After:**
```typescript
// app/sitemap.xml/route.ts
import { createSitemapHandler } from '@bigcommerce/catalyst-sitemap';
import { client } from '~/client';
import { getChannelIdFromLocale } from '~/channels.config';
import { defaultLocale } from '~/i18n/locales';

export const GET = createSitemapHandler({
  client,
  getChannelId: async () => getChannelIdFromLocale(defaultLocale),
});
```

## Requirements

- Next.js 13+ with App Router
- A configured BigCommerce client from `@bigcommerce/catalyst-client`
- Node.js 18+