---
"@bigcommerce/catalyst-core": patch
---

Add the `create-component` agent skill (`.agents/skills/create-component`). It checks the store's GraphQL schema, the store's data, and the project's theme, then builds a component that uses real fields and matches the merchant's brand. Its helper scripts look up fields (`schema.mjs`), run read-only data checks (`query.mjs`), read the theme (`brand.mjs`), and check the new code for shopper-safety mistakes (`check.mjs`).
