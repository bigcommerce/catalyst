---
"@bigcommerce/catalyst-core": minor
---

Adds an eslint rule to import expect and test from ~/tests/fixtures instead of the @playwright/test module. This is to create a more consistent testing experience across the codebase.

### Migration

Any import statements that import `expect` and `test` from `@playwright/test` should be updated to import from `~/tests/fixtures` instead. All other imports from `@playwright/test` should remain unchanged.

```diff
-import { expect, type Page, test } from '@playwright/test';
+import { type Page } from '@playwright/test';
+
+import { expect, test } from '~/tests/fixtures';
```
