---
"@bigcommerce/catalyst": patch
---

Speed up cached page renders on Storefront Hosting. Concurrent tag checks within a request now share one Durable Object read instead of each sending their own, tag lookups stay in the regional cache for 30 seconds instead of 5, and the tag cache uses fewer Durable Objects so they stay warm. Rebuild and redeploy with this CLI version to pick it up.
