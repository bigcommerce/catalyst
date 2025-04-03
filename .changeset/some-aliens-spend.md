---
"@bigcommerce/catalyst-core": patch
---

Use `setRequestLocale` in all pages and layouts and pass `locale` parameter to `getTranslations` in all `generateMetadata` to maximize static rendering. This is part of the ongoing work in preparation of enabling PPR and `dynamicIO` for all routes.
