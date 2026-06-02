---
"@bigcommerce/catalyst": patch
---

Suppress the OpenNext `env.IMAGES binding is not defined` warning in `catalyst logs tail`. OpenNext's Cloudflare image handler logs this on every `/_next/image` request when no IMAGES binding is configured, then falls back to serving the original bytes. Native Hosting intentionally runs without that binding, so the warning is expected noise — it's now filtered out of the human-readable log formats (it remains in `--format json` for raw passthrough).
