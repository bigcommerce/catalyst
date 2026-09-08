---
"@bigcommerce/catalyst": patch
---

`catalyst upgrade` now removes native-hosting-incompatible `instrumentation.ts` that a merge reintroduces, instead of leaving it for the merchant to delete by hand.
