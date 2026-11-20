---
"@bigcommerce/catalyst": patch
---

Speed up cached page renders on Storefront Hosting. Setup now pins `@opennextjs/cloudflare` 1.20.18, which reads each tag from the Durable Objects once per request instead of once per cached entry. Tag lookups also stay in the regional cache for 30 seconds instead of 5, and the tag cache uses fewer Durable Objects so they stay warm.

Migration: 1.20.18 needs Next.js 16.4.5. Run `catalyst upgrade`, then deploy; the CLI offers to update the adapter pin.
