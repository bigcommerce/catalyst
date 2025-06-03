---
"@bigcommerce/catalyst-client": minor
---

Allow passing a `locale` that will be used to set the outgoing `"Accept-Language"` header sent to the BigCommerce Storefront GraphQL API. This additional, optional paramter gives you more explicit control over what language you'd like responses to be translated into, [leveraging BigCommerce's resolved locale feature](https://developer.bigcommerce.com/docs/storefront/graphql/multi-language-support#returned-data). To incorporate these changes into your fork, either update your `@bigcommerce/catalyst-client` dependency to `0.16.0` or use the diff associated with this commit as a reference if using the workspace version of the Catalyst client.
