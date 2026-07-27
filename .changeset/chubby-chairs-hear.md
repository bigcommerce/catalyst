---
"@bigcommerce/catalyst-b2b-makeswift": patch
---

Fix B2B company registration to correctly resolve the Storefront GraphQL API domain.

- Add configurable `BIGCOMMERCE_GRAPHQL_API_DOMAIN` (defaults to `mybigcommerce.com`) and pass it through to the B2B script loader for both dev and production, fixing registration failures on non-production BigCommerce domains
- Fix swapped `data-channelid`/`data-storehash` attributes in the dev script.
