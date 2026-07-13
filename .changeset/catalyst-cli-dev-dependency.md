---
"@bigcommerce/catalyst": patch
---

Add the `@bigcommerce/catalyst` CLI to a newly created project's `devDependencies` instead of `dependencies`. The CLI is a build-time tool (it only backs the `build`/`start`/`deploy` npm scripts) and is never imported at runtime, so it doesn't belong in runtime dependencies.
