---
"@bigcommerce/catalyst-core": patch
---

Pass the customer access token through route resolution and the normal/contact webpage queries so customer-restricted web pages are accessible (and appear in navigation) for authenticated customers. The `with-routes` proxy is now wrapped in `auth()`, and webpage `page-data` queries switch to an uncached fetch when a customer token is present.
