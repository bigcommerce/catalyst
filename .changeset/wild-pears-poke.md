---
"@bigcommerce/catalyst-core": patch
---

Renames `core/app/[locale]/(default)/product/[slug]/_components/product-analytics-provider/index.tsx` to `core/app/[locale]/(default)/product/[slug]/_components/product-analytics-provider.tsx` for consistency with the other analytics components.

### Migration

To migrate, rename the file with git:

```bash
git mv core/app/[locale]/(default)/product/[slug]/_components/product-analytics-provider/index.tsx core/app/[locale]/(default)/product/[slug]/_components/product-analytics-provider.tsx
```
