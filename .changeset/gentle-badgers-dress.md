---
"@bigcommerce/catalyst-core": patch
---

Uses regular `dompurify` (DP) instead of `isomorphic-dompurify` (IDP), because IDP requires JSDOM. JSDOM doesn't work in edge-runtime environments even with nodejs compatibility. We only need it on the client anyways for the JSON-LD schema, so it doesn't need the isomorphic aspect of it. This also changes `core/app/[locale]/(default)/product/[slug]/_components/product-review-schema/product-review-schema.tsx` to be a client-component to enable `dompurify to work correctly.

## Migration

1. Remove the old dependency and add the new:
```bash
pnpm rm isomorphic-dompurify
pnpm add dompurify -S
```

2. Change the import in `core/app/[locale]/(default)/product/[slug]/_components/product-review-schema/product-review-schema.tsx`:
```diff
- import DOMPurify from 'isomorphic-dompurify';
+// eslint-disable-next-line import/no-named-as-default
+import DOMPurify from 'dompurify';
```

3. Add the `'use client';` directive to the top of `core/app/[locale]/(default)/product/[slug]/_components/product-review-schema/product-review-schema.tsx`.