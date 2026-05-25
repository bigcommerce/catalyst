---
"@bigcommerce/catalyst-core": minor
---

Consume merchant-configured per-locale URL subfolders from the BigCommerce Storefront GraphQL API (`Locale.path`) and route URLs accordingly. Treats `path: ""` as an explicit request to serve at the root and `path: null` as unconfigured (legacy fallback to the locale code). The root slot is claimed by the default locale when its path is empty or null; otherwise the first non-default locale with an empty path takes it. Locales without a custom path fall back to `/${code}` as before.
