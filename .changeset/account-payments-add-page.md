---
"@bigcommerce/catalyst-core": patch
---

Add the `/account/payment-methods/add/[paymentMethodId]` page, which renders the shopper-facing "add a payment method" form via the `storefront-account-payments` microapp. Adds a `GET /api/account/vault-token` route that mints a short-lived BigPay vault access token for the current shopper session (kept server-side, never exposed to client-side code beyond this one purpose-built endpoint).
