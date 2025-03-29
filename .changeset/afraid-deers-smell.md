---
"@bigcommerce/catalyst-core": minor
---

Moved to node.js runtime for middleware so that the `with-routes` middleware can benefit from Next.js' native Data Cache.

This eliminates the need for KV adapters in order to cache data within middleware, so the KV adapters have been removed entirely. Documentation will be updated to reflect the simplification of Catalyst to not require a KV store in order to function optimally.
