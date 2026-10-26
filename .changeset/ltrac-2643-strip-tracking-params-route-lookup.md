---
"@bigcommerce/catalyst-core": patch
---

Strip tracking params (`utm_*`, `gclid`, `fbclid`, etc.) from the route lookup cache key. Redirects whose source matches on a tracking param no longer match.
