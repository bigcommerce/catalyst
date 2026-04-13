---
"@bigcommerce/catalyst-core": patch
---

Add X-Correlation-ID header to all GraphQL requests. Each page render gets a stable UUID that persists across all fetches within the same render, enabling easier request tracing in server logs.
