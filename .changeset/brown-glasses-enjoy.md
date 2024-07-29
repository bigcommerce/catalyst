---
"@bigcommerce/catalyst-core": patch
---

Uses `next/navigation` for logging in as a customer instead of the built-in `redirectTo` option. That option was not following the `trailingSlash` config set in `next.config.js` which caused test failures.
