---
"@bigcommerce/catalyst": patch
---

Give the CLI readable, actionable errors when a BigCommerce API returns a 4xx or 5xx. A shared HTTP-error helper now turns a failed response into a clear message: it prefers the API's own reason (`detail`/`title`/field errors) and, when the body is empty or unparseable, falls back to curated copy for the status class. Client (4xx) errors are treated as user-actionable and print without the "share this Correlation ID with BigCommerce support" framing, while server (5xx) errors keep it. This replaces the raw `... failed: <status> <statusText>` throws across the `channel`, `project`, `deploy`, `logs`, and `auth` API paths.
