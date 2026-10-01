---
'@bigcommerce/catalyst-core': patch
---

Speed up routing cache reads on BigCommerce Native Hosting. The Cloudflare KV adapter now caches reads at each Cloudflare location for 5 minutes instead of Workers KV's 60-second default, so most `with-routes` lookups that miss the in-process cache take a few milliseconds instead of a trip to central KV storage. A changed route or storefront status can take up to 5 minutes to reach other locations, within the freshness windows `with-routes` already allows.

## Migration

In `core/lib/kv/adapters/cloudflare-kv.ts`, pass a `cacheTtl` when reading from the namespace:

```ts
const ROUTES_READ_CACHE_TTL_SECONDS = 60 * 5;

// RoutesKvNamespace
get(key: string, options: { type: 'json'; cacheTtl?: number }): Promise<unknown>;

// CloudflareKvAdapter.mget
const value = await this.namespace.get(key, {
  type: 'json',
  cacheTtl: ROUTES_READ_CACHE_TTL_SECONDS,
});
```
