---
"@bigcommerce/catalyst-core": minor
---

Add a new `PromotionCallout` primitive and wire promotion callouts into PDP and PLP pages using live data from the Storefront GraphQL API.

- **PDP**: a full-width banner renders above the breadcrumbs, showing all active promotions for the product sourced from `featuredPromotions` on the `Product` type.
- **PLP (category, brand, search)**: a full-width page-level banner renders at the top of each listing page, deduplicating promotions across all products on the page.
