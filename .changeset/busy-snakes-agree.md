---
"@bigcommerce/catalyst-core": patch
---

Fix possibility of duplicate `key` error in Breadcrumbs component for truncated breadcrumbs.

## Migration
Update `core/vibes/soul/sections/breadcrumbs/index.tsx` to use `index` as the `key` property instead of `href`

