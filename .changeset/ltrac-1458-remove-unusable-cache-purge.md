---
"@bigcommerce/catalyst": patch
---

Restore tag checking on regional cache hits, replacing a CDN cache purge that never worked.

`cachePurge` was declared in the generated `open-next.config.ts` but never had credentials on native hosting, so every purge attempt no-opped with `No cache zone ID or API token provided. Skipping cache purge.` The declaration alone was harmful: OpenNext's `isPurgeCacheEnabled()` only checks whether `cachePurge` is *declared*, not whether it works. Believing purge was handling invalidation, it disabled `shouldLazilyUpdateOnCacheHit` — documented as on by default for `'long-lived'` mode — and Catalyst additionally set `bypassTagCacheOnCacheHit: true`.

A regional (Cache API) hit was therefore neither purged, nor refreshed from R2, nor checked against the tag cache. Stale data was served for the full `max-age` window (the route's `revalidate`, or a 30-minute default), and `revalidateTag` calls landing in that window had no effect on it.

## Purge and tag-checking are alternatives, and we had neither

`doShardedTagCache.writeTags()` always writes the revalidation time to its Durable Object shards and always clears the regional *tag* cache. Only the CDN purge is gated behind `isPurgeCacheEnabled()`. So tag invalidation was already durable — purge exists solely to evict *incremental cache* entries held in the Cache API, which is exactly the check `bypassTagCacheOnCacheHit` was skipping.

Either mechanism delivers correct invalidation: purge evicts the entries, or the tag cache is consulted on hits. Catalyst was configured for the first and got neither.

## What changed

- Removed `bypassTagCacheOnCacheHit: true`, so the tag cache is consulted on a regional hit. The OpenNext docs require this option be paired with working purge: "make sure that the cache gets purged either by enabling the auto cache purging feature or manually."
- Removed `cachePurge: purgeCache({ type: 'durableObject' })`, restoring `shouldLazilyUpdateOnCacheHit` to its documented default so a hit also refreshes from R2 in the background.

The trade is an extra tag-cache read and R2 read on a cache hit, which is what those options were exchanging for correctness. Invalidation via `revalidateTag` now actually takes effect on regional cache hits.

## Why purge was not simply fixed

Purge requires a Cloudflare API token bound into the Worker, and a Worker binding is readable by the merchant's own application code. Cloudflare purge is zone-scoped and native hosting places all tenants on one shared zone, so a token extracted from any tenant could purge every other tenant's cache. Scoping it to Cache Purge alone reduces the severity but does not remove it.

Instant invalidation via purge remains worth having — it is faster than tag-checking and avoids the extra reads. Restoring it needs a design that keeps the credential out of tenant Workers, such as routing purge through a platform-owned worker or an authenticated service endpoint with per-tenant authorization.

The `NEXT_CACHE_DO_PURGE` Durable Object binding is intentionally left in place. OpenNext's worker template exports all three DO classes unconditionally, so the binding still resolves and no Durable Object migration is required; it is simply inert until purge returns.
