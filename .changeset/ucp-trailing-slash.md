---
"@bigcommerce/catalyst-core": patch
---

Strip the trailing slash from UCP paths before proxying them to BigCommerce. Catalyst serves trailing-slash URLs, so `/api/ucp/checkout-sessions` reached the proxy as `/api/ucp/checkout-sessions/`, and the platform answers a trailing slash with a 307 back to the bare path — which an agent resolves against the storefront domain and sends straight back, so the call never lands. Agents still follow Catalyst's own `trailingSlash` redirect on the way in.
