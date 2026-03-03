---
"@bigcommerce/catalyst-core": patch
---

Fix analytics visit count inflation by implementing a sliding window for the visit cookie TTL, guarding against prefetch/RSC requests creating spurious visits, and reordering middleware so analytics cookies survive locale redirects.
