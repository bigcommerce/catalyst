# PROJECT-6074 · catalyst · Stripe OCS credit card vaulting in My Account

**Repo:** `bigcommerce/catalyst` — `/Volumes/proj/bc/catalyst`
**Branch:** `poc/PROJECT-6074-account-payments-microapp` (continue on the existing POC branch)
**Effort:** medium
**Builds on:**
- The ECP render POC already on this branch (the `account/payment-methods` route, the microapp loader).
- The storefront mutations `createVaultToken` (`PROJECT-6074-PLAN.md`) and `createVaultInitialization` (`PROJECT-6074-STRIPE-PLAN.md`).

## Goal

End to end on Catalyst `/account/payment-methods`: a shopper adds a Stripe credit card, it is set up with Stripe (`confirmSetup`) and vaulted in BigPay (`stored_instruments` POST authorized by the VAT), and it then appears via `customer.storedPaymentInstruments`.

**Broader context:** `/Volumes/proj/mine/kb/bc/payments/vaulting/storefront/catalyst/vault-PROJECT-6074/index.html` (§2 two tokens, §3 flow, §9 catalyst, §11.4 the POST proxy).

## Verified facts (from the microapp source — these shape the whole plan)

- The microapp renders the OCS **credit card** form entirely from `storeContextData` **when `paymentProviderInitializationData.setupIntentToken` is present**. That presence selects the Stripe Payment Element path, which reads the publishable key and client secret from init data, mounts the Element, and calls `confirmSetup` itself. It **never** calls the runtime `/initialize` endpoint on the card path. So **no microapp change is required** (see the microapp `PROJECT-6074-STRIPE-PLAN.md`). Catalyst must therefore mint the setup token server-side and pass it in init data.
- The microapp sends `storeContextData.vaultToken` **verbatim** as the `Authorization` header, with no scheme added. BigPay expects `VAT <jwt>`. So Catalyst must set `vaultToken` to the full `"VAT <token>"` string.
- The vault write goes to `` `${paymentsUrl}/stores/${storeHash}/customers/${shopperId}/stored_instruments` ``. `paymentsUrl` is host-configurable, so point it at a same-origin Catalyst proxy to avoid a cross-origin POST (doc §11.4).
- Stripe.js is loaded from `js.stripe.com`, and on success the microapp does `window.location.href = paymentMethodsUrl` (a full-page navigation).

## Current state

- `core/app/[locale]/(default)/account/payment-methods/page.tsx` — fake list page, one ECP section.
- `.../add/page.tsx` + `.../add/page-data.ts` — server component; `getMicroappAssets()` reads the CDN manifest, `getMicroappCountries()` queries `geography.countries` with the customer access token.
- `.../add/_components/account-payments-microapp.tsx` — `'use client'`; loads the bundle and calls `renderAccountPayments` with **hardcoded ECP** `storeContextData`.

## The change

1. **GraphQL documents (gql.tada).** Add both mutations, requested in one document so the client makes one round-trip. `createVaultInitialization` returns a **typed union**, so query the Stripe arm with an inline fragment:
   ```graphql
   mutation AddCardVaultContext($providerId: ID!) {
     payment { storedInstrument {
       createVaultToken { vaultToken expiresIn }
       createVaultInitialization(providerId: $providerId) {
         data {
           ... on StripeOcsVaultInit { publishableKey setupIntentClientSecret connectedAccount }
         }
       }
     } }
   }
   ```
   - gql.tada types the result, so `data` is a discriminated union and the Stripe fields are checked at compile time. Catalyst maps `StripeOcsVaultInit` into the microapp's `paymentProviderInitializationData` shape (step 4). That small mapper is the client-side deserializer, and the rename into the microapp's fixed field names is the one intentional mapping in the pipeline. If `data` resolves to a union member Catalyst did not request (a provider added server-side but not yet wired here), treat it as unsupported and show a clear error rather than rendering.
   - Run it **server-side** in `page-data.ts` with `getSessionCustomerAccessToken()` (same pattern as `getMicroappCountries`). The VAT and setup token only ever reach the browser inside `storeContextData` at render.

2. **`page-data.ts`:** add `getVaultContext(providerId: string)` that runs the mutation and returns `{ vaultToken, init }`, where `init` is the typed union member. Keep the signature provider-generic; the caller passes `"stripeocs"` and narrows `init` on `__typename`.

3. **The add page (`page.tsx`):** branch on `provider` / `method_type` from the route. For `stripeocs` card, fetch assets + countries + `getVaultContext("stripeocs")` and pass a fully-assembled `storeContextData` to the client component. Keep the existing ECP branch working.

4. **`account-payments-microapp.tsx` (client):** parametrize it to accept `storeContextData` from props instead of hardcoding ECP. For Stripe card, pass:
   ```ts
   storeContextData: {
     providerId: 'stripeocs',
     // map the typed StripeOcsVaultInit union member into the microapp's StripeOCSInitializationData shape
     paymentProviderInitializationData: {
       stripePublishableKey: init.publishableKey,
       setupIntentToken: init.setupIntentClientSecret,
       ...(init.connectedAccount ? { stripeConnectedAccount: init.connectedAccount } : {}),
     },
     vaultToken: `VAT ${vaultToken}`,     // microapp sends this verbatim as Authorization; include the scheme
     paymentsUrl: '/api/payments-proxy',  // same-origin proxy base (step 5)
     storeHash: process.env.BIGCOMMERCE_STORE_HASH,
     shopperId,          // customer entityId
     customerEmail,      // used in confirmSetup billing_details
     currencyCode,
     storeLocale,        // active locale
     countries,          // billing-address dropdown
     paymentMethodsUrl: '/account/payment-methods', // post-success redirect target
     // methodType is not needed on the card path
   }
   ```
   Wire `errorHandler` to a Catalyst toast. The `<div id="bc-account-payments">` mount node already exists in the POC.

5. **Same-origin `stored_instruments` proxy (doc §11.4).** Add a Catalyst route handler, for example `core/app/api/payments-proxy/[...path]/route.ts`, that forwards `POST` (and any method) to `` `${process.env.PAYMENTS_HOST}/${path.join('/')}` `` server-to-server, preserving the request body and the `Authorization` header, and relaying the response. Set `storeContextData.paymentsUrl` to `/api/payments-proxy` so the microapp's `` `${paymentsUrl}/stores/.../stored_instruments` `` resolves same-origin. This removes the CORS problem and keeps the VAT on a same-origin request.
   - Env: add `PAYMENTS_HOST` (the BigPay/payments host for the environment). `NODE_TLS_REJECT_UNAUTHORIZED="0"` is already set for local bcdev.

6. **CSP (only if Catalyst enforces one).** Allow Stripe: `script-src https://js.stripe.com`, `frame-src https://js.stripe.com https://hooks.stripe.com`, `connect-src https://api.stripe.com`.

7. **List page:** link per provider to `/account/payment-methods/add?provider=stripeocs&method_type=card`. Keep the ECP link. The real provider list is a later Storefront GraphQL surface (doc §11.6); the POC list stays fake.

## Provider-generic, Stripe-first

The mutation, the `getVaultContext` fetch, and the proxy are all provider-agnostic: a `providerId` argument, a typed `VaultInitializationData` union, and a generic pass-through proxy. The only Stripe-aware code is the inline fragment plus the small mapper from `StripeOcsVaultInit` into the microapp's `StripeOCSInitializationData` shape. Adding the next provider is: pass its `providerId`, add its union arm and fragment, add its mapper, link to its add route. No new Catalyst API.

## Out of scope / follow-ups

- **Stripe ACH** and any provider that mints its own setup token at runtime will hit the microapp's hardcoded `POST /api/storefront/payments/stored-instruments/initialize` (ACH branch only). When needed, add a same-origin Catalyst proxy at that exact path forwarding to `createVaultInitialization` / BigPay, or take the microapp base-URL change (see the microapp plan). Not needed for card.
- Real provider list and stored-instruments list come from new Storefront GraphQL surfaces (doc §11.2, §11.6).

## Dependencies

- storefront: `createVaultToken` + `createVaultInitialization`. Develop against a storefront running those (which in turn need the interfaces + bigpay changes and the PROJECT-7909 flag enabled for the store).
- No microapp change.

## Done when

- On Catalyst `/account/payment-methods`, adding a Stripe test card mounts the Stripe Payment Element, `confirmSetup` succeeds, the instrument POSTs through `/api/payments-proxy` with `Authorization: VAT <token>`, and the saved card then appears via `customer.storedPaymentInstruments`.
- No microapp code change was required.
