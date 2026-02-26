---
"@bigcommerce/catalyst-core": patch
---

Show backorder details for digital items on cart page

## Migration
For existing Catalyst stores, to this fix, simply rebase the existing code with the new release code. The files to be rebased for this change to be applied are:
- core/app/[locale]/(default)/cart/page-data.ts
- core/app/[locale]/(default)/cart/page.tsx
