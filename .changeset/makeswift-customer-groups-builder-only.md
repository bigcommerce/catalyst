---
"@bigcommerce/catalyst-makeswift": patch
---

Only serve `/api/customer/groups` inside a Makeswift builder session, and return `403` otherwise. The route calls the BigCommerce REST API with the store-level `BIGCOMMERCE_ACCESS_TOKEN`, so anyone could list every customer group (including discount rules) and spend the store's API quota. Builder responses are now cached by the browser for 60 seconds.
