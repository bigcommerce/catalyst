---
'@bigcommerce/catalyst-core': minor
---

Replace the language and currency dropdowns in the mobile menu with labelled native selects, which open the device's own picker, and make the mobile menu fill the screen below the nav, with the links scrolling above the selects pinned at the bottom. The currency select now also shows on stores with a single language. Desktop keeps the dropdowns.

## Migration

The mobile menu's locale and currency controls in `core/vibes/soul/primitives/navigation/index.tsx` are now `MobileLocaleSelect` and `MobileCurrencySelect`. The `Navigation` component takes two new optional label props, `localeLabel` (default `Language`) and `currencyLabel` (default `Currency`), and `core/components/header/index.tsx` passes the new `Header.localeLabel` and `Header.currencyLabel` messages to them. If you customized the mobile dropdowns, port those changes to the new selects.
