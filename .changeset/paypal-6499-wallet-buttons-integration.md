---
"@bigcommerce/catalyst-core": minor
---

Add Wallet Payment buttons integration for cart page

## What changed

- Render wallet payment buttons (e.g. PayPal) on the cart page when payment wallets are configured for the cart.
- Added `getPaymentWallets`, `getPaymentWalletWithInitializationData`, and `getCurrencyData` GraphQL queries in the cart's `page-data.ts` to fetch configured wallets and their initialization data.
- Added a `ClientWalletButtons` client component (`core/components/wallet-buttons`) that streams wallet init options and renders a container per wallet button.
- Added a `WalletButtonsInitializer` (`core/lib/wallet-buttons`) that lazily injects the BigCommerce Checkout SDK loader script and initializes each wallet button against the `/graphql` endpoint, with an `InitializationError` for missing loader.
- Wired `walletButtonsInitOptions` and `cartId` through the cart section component, and exposed `getCurrencyData` currency formatting details.
- Extended the GraphQL proxy (`with-graphql-proxy.ts` / `proxy.ts`) to support Checkout SDK wallet-button requests.
- Added `NEXT_PUBLIC_CHECKOUT_SDK_DEV_URL` to `.env.example` to optionally override the Checkout SDK loader URL in development.
- Added e2e coverage (`wallet-buttons.spec.ts`) verifying the loader script and wallet button containers render only when wallets are configured.