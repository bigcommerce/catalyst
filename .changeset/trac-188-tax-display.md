---
"@bigcommerce/catalyst-core": minor
---

Honor the merchant's Tax Display setting (`Inc.`, `Ex.`, or `Both`) from the BigCommerce control panel across PDP, PLP, search, compare, and home. When set to `Both`, prices render stacked with `(Inc. Tax)` and `(Ex. Tax)` labels, including sale strike-throughs per line.

## Migration

For forks that can't rebase cleanly:

- **`PricingFragment`**: bare `prices(currencyCode)` replaced with two aliased fields, `pricesIncludingTax` and `pricesExcludingTax`. Update any direct reads of `product.prices`.
- **Settings queries**: add `tax { pdp }` (PDP) or `tax { plp }` (every other surface) to each page-data query's `settings` selection.
- **`pricesTransformer`** signature now `(pricing, format, taxDisplay)` and outputs a new shape with a `mode` field. The `Price` union added `Money` and `PricePlain`. Forks importing `Price` directly need updates.
- **Page handlers**: read the relevant `settings.tax.<surface>` and pass to `productCardTransformer` / `pricesTransformer`.
- **Analytics + SEO**: new helper at `core/lib/tax-pricing.ts`. Wire to `product-viewed`, `product-schema`, `category-viewed`, wishlist pages, compare page.
- **Translations**: four new keys in `core/messages/en.json` under `Components.Price`: `includingTax`, `excludingTax`, `includingTaxFull`, `excludingTaxFull`.
