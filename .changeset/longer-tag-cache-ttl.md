---
"@bigcommerce/catalyst": patch
---

Speed up cached page renders on Storefront Hosting. Concurrent tag checks within a request now share one Durable Object read instead of each sending their own, and tag lookups stay in the regional cache for 30 seconds instead of 5. Rebuild and redeploy with this CLI version to pick it up.
