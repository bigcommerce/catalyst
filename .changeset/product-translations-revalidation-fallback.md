---
"@bigcommerce/catalyst-core": patch
---

Fix product, category, and brand content falling back to the default language after ISR revalidation. `generateMetadata` fetched page data through `cache()`-memoized loaders before calling `setRequestLocale`, so during background regeneration (no request) next-intl could not resolve the locale, the storefront client omitted `Accept-Language`, and the default-locale response poisoned the memoized cache for the whole render. `setRequestLocale(locale)` is now called before the fetch in each `generateMetadata`.
