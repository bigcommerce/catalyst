---
"@bigcommerce/catalyst": patch
---

`catalyst build` now derives the Cloudflare Workers `compatibility_date` dynamically (current date minus one month) instead of using a pinned date, keeping the build-time runtime semantics aligned with what the deployment service applies at deploy time.
