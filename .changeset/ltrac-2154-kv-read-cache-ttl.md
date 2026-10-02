---
'@bigcommerce/catalyst-core': patch
---

Speed up routing cache reads on BigCommerce Native Hosting. The Cloudflare KV adapter now caches reads at each Cloudflare location for 5 minutes instead of Workers KV's 60-second default, so most `with-routes` lookups that miss the in-process cache take a few milliseconds instead of a trip to central KV storage. The trade-off is staleness: in the worst case, a storefront status change (maintenance mode, launch) can take up to about 11 minutes to reach a location instead of about 7. It's usually sooner, since the background refresh's write is normally visible at once in the location that made it. Route changes have the same 4 extra minutes on top of their 30-minute window.

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
