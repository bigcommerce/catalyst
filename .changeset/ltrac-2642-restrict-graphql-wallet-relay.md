---
"@bigcommerce/catalyst-core": patch
---

Only relay checkout-sdk-js wallet button operations through `/graphql`; reject anything else with a `403`.
