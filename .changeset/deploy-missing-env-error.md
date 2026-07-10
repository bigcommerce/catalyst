---
"@bigcommerce/catalyst": patch
---

Fail `catalyst build`/`catalyst deploy` fast with a clear, actionable error when required environment variables (`BIGCOMMERCE_STORE_HASH`, `BIGCOMMERCE_STOREFRONT_TOKEN`, `AUTH_SECRET`) aren't loaded, instead of surfacing a raw OpenNext/Next.js build stack trace. The message names the missing variables and suggests loading them with `--env-path` (e.g. `--env-path .env.local`).
