---
"@bigcommerce/catalyst-core": patch
---

Add translations for 'Search' button on 404 page

## Migration

1. Add `"search"` translation key in the `"NotFound"` translations
2. In `core/vibes/soul/sections/not-found/index.tsx`, add a `ctaLabel` property and ensure it is used in place of the "Search" text
3. In `core/app/[locale]/not-found.tsx`, pass the `ctaLabel` prop as the new translation key `ctaLabel={t('search')}`
