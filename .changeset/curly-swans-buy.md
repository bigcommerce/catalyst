---
"@bigcommerce/catalyst-core": patch
---

Add 'guest' prefetch strategy for link component to allow aggressive prefetching for certain links for highly-cacheable guest views

Also adds logger for prefetch behavior which can be enabled via environment variable NEXT_PUBLIC_LINK_PREFETCH_LOGGER
