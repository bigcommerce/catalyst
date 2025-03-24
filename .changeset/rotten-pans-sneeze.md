---
"@bigcommerce/catalyst-core": patch
---

Fix an issue with orders with deleted products throwing an error and stopping page render by settings the errorPolicy for requests to ignore errors and update Soul components to render the products without using links for these cases.
