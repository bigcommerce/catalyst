---
"@bigcommerce/catalyst-core": patch
---

feat(search):ES-5892 Introduce displayName and displayKey fields to facets

- Added `displayName` field to all facet filter types in GraphQL query
- Updated facet transformer to use `displayName` instead of deprecated `name` field
- Added `filterKey` field support for product attribute facets
