---
"@bigcommerce/catalyst-core": patch
---

Strip tracking params (`utm_*`, `gclid`, `fbclid`, `msclkid` and other common click IDs) and sort the remaining query params before resolving a route in the `withRoutes` proxy. Requests that differ only in tracking params now share one route cache entry instead of each one triggering a blocking route lookup. Redirects and rewrites still receive the original query string, so tracking params continue to reach the page and redirect targets.
