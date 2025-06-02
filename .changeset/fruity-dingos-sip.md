---
"@bigcommerce/catalyst-core": patch
---

Memoize `GetCartCountQuery` using React.js `cache()` so that it only hits the GraphQL API once per render, instead of twice.
