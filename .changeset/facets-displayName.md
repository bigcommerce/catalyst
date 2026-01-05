---
"@bigcommerce/catalyst-core": minor
---

Introduce displayName and displayKey fields to facets for improved labeling and filtering

Facet filters now use the `displayName` field for more descriptive labels in the UI, replacing the deprecated `name` field. Product attribute facets now support the `filterKey` field for consistent parameter naming. The facet transformer has been updated to use `displayName` with a fallback to `filterName` when `displayName` is not available.
