---
"@bigcommerce/catalyst": patch
---

Bind a `CATALYST_ROUTES_KV` Cloudflare KV namespace in the generated Wrangler config, so the routing cache used by `proxies/with-routes` has a shared store on BigCommerce Native Hosting instead of degrading to a per-invocation in-memory cache. The generated config points at a local-only placeholder namespace id used by `wrangler dev`/`catalyst start` and the `wrangler deploy --dry-run` bundling step; the real per-project namespace is bound at deploy time.
