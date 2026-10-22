---
"@bigcommerce/catalyst-core": patch
---

Strip tracking params (`utm_*`, `gclid`, `fbclid`, `msclkid` and other common click IDs) from the query string used to resolve a route in the `withRoutes` proxy. Requests that differ only in tracking params now share one route cache entry instead of each one triggering a blocking route lookup. Redirects and rewrites still receive the tracking params, including redirects that match on specific query params. 301 redirects whose source path matches on a tracking param (for example `/old?utm_campaign=spring`) no longer match; match on the path or a non-tracking param instead.
