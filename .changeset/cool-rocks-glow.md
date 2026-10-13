---
"@bigcommerce/catalyst-makeswift": patch
---

Upgrade @makeswift/runtime from 0.28.5 to 0.29.1. The Makeswift revalidate window (MAKESWIFT_REVALIDATE_TARGET) is now applied by the runtime's fetch in lib/makeswift/fetch.ts, since Makeswift#fetchOptions no longer exists.
