---
"@bigcommerce/catalyst-core": patch
---

Disable caching for the webpage sidebar navigation and route/raw-page resolution when a customer access token is present, so customer-only navigation links and pages aren't leaked to (or hidden from) other visitors via a shared cache.
