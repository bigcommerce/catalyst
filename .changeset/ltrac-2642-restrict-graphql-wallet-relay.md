---
"@bigcommerce/catalyst-core": patch
---

Restrict the `/graphql` relay used by checkout-sdk-js wallet buttons to the wallet button operations (payment wallet intent creation, checkout billing address updates and the checkout redirect URL). Any other query or mutation sent with the `x-catalyst-graphql-proxy-requester` header is now rejected with a 403 instead of being forwarded to BigCommerce. Relayed requests are also no longer cacheable, so the shopper's IP address is forwarded to BigCommerce.
