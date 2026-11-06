---
'@bigcommerce/catalyst': patch
---

Keep `instrumentation.ts` and `@vercel/otel` during Storefront Hosting setup when the hook already sends spans to Workers tracing, instead of prompting to remove them.
