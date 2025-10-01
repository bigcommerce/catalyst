---
"@bigcommerce/catalyst-makeswift": patch
---

Switch to using `ReactRuntimeCore` instead of `ReactRuntime`, avoiding the bundling of unused dependencies from some Makeswift builtin components. Also bumps to latest `@makeswift/runtime`.
