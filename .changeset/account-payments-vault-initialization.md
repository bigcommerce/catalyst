---
"@bigcommerce/catalyst-core": patch
---

Pass provider initialization data to the account payments microapp, so payment methods that require it can render their vaulting form. Adds a `GET /api/account/vault-initialization` route that calls the payment provider's own Storefront GraphQL vault initialization field. Stripe OCS uses the `createStripeOcsVaultInitialization` mutation, because it creates a SetupIntent. Square v2 uses the `customer.squareV2VaultInitialization` query, because it only reads the merchant's configuration. The route keeps the provider initialization and any provider-issued secret out of server-rendered page data, and mints them only through this one authenticated, per-request endpoint. The initialization is forwarded as the API returns it. Shaping it into each provider's SDK arguments is the microapp's responsibility. Supporting a further provider means calling its field from `getVaultInitialization`.
