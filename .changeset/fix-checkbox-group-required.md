---
"@bigcommerce/catalyst-core": patch
---

Fix `formField.required` mismatch for `checkbox-group` fields in `DynamicForm`. The schema branch was missing `.optional()` for non-required checkbox groups.

