---
"@bigcommerce/catalyst-core": patch
---

Pass provider initialization data to the account payments microapp, so payment methods that require it can render their vaulting form. Adds a `GET /api/account/vault-initialization` route that creates a vault initialization through the `createVaultInitialization` Storefront GraphQL mutation, keeping the provider configuration and any provider-issued token out of server-rendered page data and minting them only through this one authenticated, per-request endpoint. Square V2 and Stripe OCS are the providers that currently expose a client configuration. The configuration is forwarded as the API returns it — shaping it into each provider's SDK arguments is the microapp's responsibility, so supporting a further provider is a query selection rather than new mapping code.
