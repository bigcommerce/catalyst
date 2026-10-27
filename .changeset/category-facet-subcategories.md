---
"@bigcommerce/catalyst-core": patch
---

Include sub-categories when filtering by the Category facet on brand and search pages. Selecting a parent category previously returned no products when they were assigned only to its sub-categories, even though the facet's counts included them.
