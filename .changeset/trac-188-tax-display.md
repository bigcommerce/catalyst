---
"@bigcommerce/catalyst-core": minor
---

Honor the merchant's Tax Display setting (`Inc.`, `Ex.`, or `Both`) from the BigCommerce control panel across PDP, PLP, search, compare, and home. When set to `Both`, prices render stacked with `(Inc. Tax)` and `(Ex. Tax)` labels, including sale strike-throughs per line.

## Migration

For forks that can't rebase cleanly: pricing was refactored end-to-end to support inc/ex tax variants and a `Both` mode (`PricingFragment`, `pricesTransformer`, `Price` types, page-data settings queries, analytics helpers). See PR #3024 for the full diff.
