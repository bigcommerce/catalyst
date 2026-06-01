---
"@bigcommerce/catalyst": patch
---

Remove `core/instrumentation.ts` and the `@vercel/otel` dependency during Commerce Hosting setup. The hook isn't compatible with the OpenNext + Cloudflare Workers bundling path and caused a "Failed to prepare server" error on every cold start in `catalyst logs tail`. Self-hosted (non-Commerce Hosting) deployments are unaffected.
