---
"@bigcommerce/catalyst-makeswift": patch
---

Upgrade `@makeswift/runtime` to `0.26.3`, which uses the `<Activity>` API instead of `<Suspense>`. This fixes layout shift both when loading a Makeswift page directly and when client-side navigating from a non-Makeswift page to a Makeswift page after a hard refresh.
