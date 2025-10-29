---
"@bigcommerce/catalyst-core": minor
---

Integrated cookie consent management with the storefront's Control Panel settings, ensuring consent behavior matches Stencil 1:1. When cookie consent is disabled, all script categories load; when enabled without user consent, Essential, Targeting, and Unknown scripts load; when enabled with consent, scripts from consented categories plus Unknown scripts load.
