---
"@bigcommerce/catalyst-core": patch
---

Add `NEXT_DISABLE_METADATA_BASE` environment variable to disable canonical URL and hreflang alternate tags. When set to `'true'`, `metadataBase`, canonical URLs, and hreflang alternates are omitted from all pages. This is useful for preview deployments (Vercel, Cloudflare, etc.) where the vanity URL from BigCommerce points to production and causes SEO mismatch warnings. Default behavior (canonical tags enabled) is unchanged.
