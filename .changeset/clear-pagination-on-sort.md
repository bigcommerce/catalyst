---
"@bigcommerce/catalyst-core": patch
---

Fix pagination cursor persistence when changing sort order. The `before` and `after` query parameters are now cleared when the sort option changes, preventing stale pagination cursors from causing incorrect results or empty pages.
