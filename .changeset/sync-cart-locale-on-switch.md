---
"@bigcommerce/catalyst-core": patch
---

Keep the cart's locale in sync when a shopper switches their storefront locale. Previously, changing the locale only updated the storefront URL and left the cart on its original locale. The locale switcher now calls the new `updateCartLocale` Storefront GraphQL mutation to update the active cart in place before navigating, mirroring the existing currency-switch behavior. This mutation is currently gated behind a store-side feature flag; until it's enabled, `updateCartLocale` returns `null` and the switch is a no-op.
