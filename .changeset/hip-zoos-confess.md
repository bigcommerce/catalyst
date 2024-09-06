---
"@bigcommerce/catalyst-core": patch
---

Splits i18n into request.ts and routing.ts This helps reduce our middleware bundle as we no longer do a dynamic import on our middleware entrypoint.
