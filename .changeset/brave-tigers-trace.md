---
"@bigcommerce/catalyst": patch
---

Add crash reporting with trace IDs. On any CLI error, a UUID trace ID is displayed that can be shared with BigCommerce support. All BigCommerce API requests now include an `X-Correlation-Id` header for request tracing.
