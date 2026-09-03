---
"@bigcommerce/catalyst": patch
---

`catalyst build` and `catalyst deploy` now run GraphQL codegen (`generate`) automatically, so a fresh project no longer needs a manual `pnpm build` before its first deploy.
