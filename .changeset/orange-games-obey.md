---
"@bigcommerce/catalyst-core": major
---

Add current stock message to product details page based on the store/product inventory settings.

## Migration
For existing Catalyst stores, to get the newly added feature, simply rebase the existing code with the new release code. The files to be rebased for this change to be applied are:
- core/messages/en.json
- core/app/[locale]/(default)/product/[slug]/page-data.ts
- core/app/[locale]/(default)/product/[slug]/page.tsx
