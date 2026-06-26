---
"@bigcommerce/catalyst-core": minor
---

Wire promotion callouts into PDP and PLP pages using live data from the Storefront GraphQL API (`featuredPromotions` on the `Product` type).

- **PDP**: stacked callout boxes render inline below the price, one per active promotion.
- **PLP (category, brand, search)**: each product card shows its first promotion inline below the price; if there are multiple, a "+N more" label appears within the same callout.
