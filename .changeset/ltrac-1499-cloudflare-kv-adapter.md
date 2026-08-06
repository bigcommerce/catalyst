---
"@bigcommerce/catalyst-core": patch
---

Use Cloudflare Workers KV for the routing cache on BigCommerce Native Hosting. `proxies/with-routes` caches redirects and storefront status through the KV abstraction in `lib/kv`, which previously had no Cloudflare option and silently degraded to an in-process memory cache that isn't shared across edge invocations. When the per-project `CATALYST_ROUTES_KV` namespace is bound to the Worker, `createKVAdapter` now selects a `CloudflareKvAdapter`. Vercel Runtime Cache still takes priority, and Upstash/memory remain the fallbacks; the binding is duck-typed so an unrelated env var of the same name falls through cleanly instead of throwing.
