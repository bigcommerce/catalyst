---
"@bigcommerce/catalyst": patch
---

Replace the Durable Object revalidation queue with a self-fetch queue, so ISR revalidation can work on native hosting at all.

**This does not make anything faster, and changes no behavior today.** Catalyst currently ships no route with a revalidate window, so the queue is never invoked. From the built prerender manifest, every prerendered route is `initialRevalidateSeconds: false` and `dynamicRoutes` is empty. The `next: { revalidate }` options on the product and faceted-search queries are fetch-level data caching and do not feed this queue.

What this fixes is a trap rather than a slowdown: with the previous config, the first route to adopt ISR would have failed to revalidate *silently*, because the error thrown below is an `IgnorableError` (`logLevel = 0`, dropped by OpenNext's logger under the default threshold). Pages would have gone permanently stale with nothing in the logs.

OpenNext's `doQueue` routes revalidation through a Durable Object whose constructor reads `env.WORKER_SELF_REFERENCE` and throws without it:

```js
this.service = env.WORKER_SELF_REFERENCE;
if (!this.service)
    throw new IgnorableError("No service binding for cache revalidation worker");
```

**That binding cannot exist on native hosting.** A Cloudflare `service` binding resolves against account-level Workers, and a Catalyst deployment is a script inside a dispatch namespace, which is not addressable that way. Adding it was attempted and rejected at upload:

```
400 Bad Request  code 10143
Service binding 'WORKER_SELF_REFERENCE' references Worker
'…' which was not found.
```

The `dispatch_namespace` binding sometimes suggested as the alternative is worse: OpenNext calls `.fetch()` directly on the value while that binding exposes `.get(name)`, and `.get()` accepts *any* script in the namespace — binding it into a tenant Worker would let any deployment invoke any other deployment's Worker.

## What changed

Revalidation does not require a binding. It is a `HEAD` request to the page's own public URL carrying the build-time preview secret — exactly what the Durable Object issues once it holds the service handle. `queue` now uses a small self-contained queue that issues that request with a plain `fetch`, which leaves and re-enters through the dispatch router and arrives at the same Worker. `global_fetch_strictly_public` is already set, so the subrequest is not short-circuited internally.

It remains wrapped in `queueCache`, so concurrent stale hits for one path still collapse into a single revalidation.

**Trade-off:** the Durable Object's retry and max-concurrency handling is lost. A failed revalidation is retried on the next stale hit rather than by the queue itself, and revalidations are no longer capped at a concurrency limit.

The `NEXT_CACHE_DO_QUEUE` binding is intentionally left in place. OpenNext's worker template exports all three Durable Object classes unconditionally, so it still resolves and needs no Durable Object migration; it is simply inert.
