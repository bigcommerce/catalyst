---
"@bigcommerce/catalyst-makeswift": patch
---

Declare a revalidate window for Makeswift API requests, and add `MAKESWIFT_REVALIDATE_TARGET` to configure it.

The Makeswift SDK tags its responses with `@@makeswift` but never declares a TTL. Under the `fetchCache = 'default-cache'` segment config, Next.js reads "no cache config" as "cache forever", so published content was cached indefinitely and only the `site.published` webhook could refresh it. On any host Makeswift cannot reach — a local dev server, or a deployment it isn't configured to notify — content froze permanently, and deleting `.next` was the only way to see an edit.

Requests for the published site now declare a revalidate window: 3600 seconds by default, or 0 in development, where the webhook never arrives and the TTL is the only invalidation. Draft-mode requests are unchanged; they already opt out of caching, and adding a revalidate value there would trip Next.js's conflicting-config rule and cache the builder's live edits indefinitely.
