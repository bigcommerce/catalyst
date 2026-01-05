---
"@bigcommerce/catalyst-core": minor
---

Add the following backorder messages to PDP based on the store inventory settings and the product backorders data:
- Backorder availability prompt
- Quantity on backorder
- Backorder message

## Migration
For existing Catalyst stores, to get the newly added feature, simply rebase the existing code with the new release code. The files to be rebased for this change to be applied are:
- core/messages/en.json
- core/app/[locale]/(default)/product/[slug]/page-data.ts
- core/app/[locale]/(default)/product/[slug]/page.tsx
- core/app/[locale]/(default)/product/[slug]/_components/product-viewed/fragment.ts
- core/vibes/soul/sections/product-detail/index.tsx
- core/vibes/soul/sections/product-detail/product-detail-form.tsx