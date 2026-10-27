---
'@bigcommerce/catalyst-core': patch
---

Forward the caller's IP as `X-Forwarded-For` and `True-Client-IP` on the UCP proxy, as the GraphQL client already does, so BigCommerce can apply per-IP limits to UCP requests.
