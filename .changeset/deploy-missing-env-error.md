---
"@bigcommerce/catalyst": patch
---

Fail `catalyst build`/`catalyst deploy` fast with a clear, actionable error when required environment variables (`BIGCOMMERCE_STORE_HASH`, `BIGCOMMERCE_STOREFRONT_TOKEN`, `BIGCOMMERCE_CHANNEL_ID`, `AUTH_SECRET`) aren't loaded, instead of surfacing a raw OpenNext/Next.js build stack trace. The check also runs on the plain `next build` fallthrough (non-Commerce-Hosting projects), not just the Commerce Hosting pipeline. The message names the missing variables and explains that the build auto-loads `.env.local` from the current directory (or pass `--env-path <path>` to load a file from elsewhere).
