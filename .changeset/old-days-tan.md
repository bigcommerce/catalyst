---
"@bigcommerce/catalyst-core": patch
---

Fixed issue with 301 redirect loops when `TRAILING_SLASH` is set to `false`, or when 301 redirects exist targeting the same path but with different capitalization.
