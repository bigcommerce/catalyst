---
'@bigcommerce/catalyst-core': minor
---

Show catalog product attributes on the product page. The product page now queries `Product.attributes` and lists each attribute's display name and value in the Specifications accordion, after the custom fields. Products without attributes look the same as before.

## Migration

In `core/app/[locale]/(default)/product/[slug]/page-data.ts`, `StreamableProductQuery` now selects `attributes(first: 50) { edges { node { displayName value } } }`. In `core/app/[locale]/(default)/product/[slug]/page.tsx`, the specifications list adds those attributes after the custom fields. If you customized the Specifications accordion, add the attributes the same way.
