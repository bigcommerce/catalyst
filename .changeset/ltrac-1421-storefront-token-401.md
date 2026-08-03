---
"@bigcommerce/catalyst-client": patch
---

Surface a clearer error when `BIGCOMMERCE_STOREFRONT_TOKEN` is not a storefront JWT. Previously an incompatible token (e.g. an OAuth access token) produced a bare 401 with no explanation. The client now detects when a 401 is returned with a token that isn't a well-formed storefront JWT and throws `InvalidStorefrontTokenError` explaining that a storefront JWT is required and how to generate one.
