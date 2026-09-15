---
"@bigcommerce/catalyst-core": patch
---

Stop sending `X-Correlation-ID` on cacheable GraphQL requests, which was making every Next.js Data Cache lookup miss.

The correlation ID is a fresh `crypto.randomUUID()` per request, memoized for the duration of a render by `React.cache`. Next.js builds its Data Cache key from the fetch URL, method, body **and headers** (`generateCacheKey` in `next/dist/server/lib/incremental-cache`), so a header that changes on every request produces a unique key on every request. Fetches configured with `next: { revalidate }` could therefore never hit: each one missed, went out to the BigCommerce GraphQL API, and wrote a new entry that nothing would ever read again. On a product page that is ~12 queries per page view — the full uncached render cost, every time, plus unbounded growth in the data cache.

Next.js already strips `traceparent` and `tracestate` from the cache key for exactly this reason, but it can only do that for headers it knows about.

The correlation ID now follows the same rule as `X-Forwarded-For` and `True-Client-IP` in the same hook: it is attached only when `fetchOptions.cache` is `no-store` or `no-cache`. Those requests are uncacheable by construction, so there is no cache key to pollute, and they are the per-customer requests where a correlation ID is most useful for tracing. Cacheable requests now share a stable key and hit the Data Cache as intended.
