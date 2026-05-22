---
"@bigcommerce/catalyst-core": minor
---

Consume merchant-configured per-locale URL subfolders from the BigCommerce Storefront GraphQL API (`Locale.path`). The locale that sits at the bare root URL (`/`) is derived from the CP configuration: if the default locale has no path, it sits at root; otherwise, if exactly one non-default locale has no path, that one sits at root; otherwise every locale gets a prefix. Locales with a path use it; locales without a path fall back to their locale code.
