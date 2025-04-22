---
"@bigcommerce/catalyst-core": minor
---

## New

This refactor optimizes category PLP for caching and the eventual use of dynamicIO. With these changes we leverage data caching to hit mostly cache data for guest shoppers in different locales and with different currencies.

## Key modifications include:

- We don't stream in Category page data, instead it's a blocking call that will redirect to `notFound` when category is not found. Same for metadata.
- Our query functions now take in all params required for fetching, instead of accessing dynamic variables internally. This is important to serialize arguments if we want to eventually `use cache`.
- Use `Streamable.from` to generate our streaming props that are passed to our UI components.
- Remove use of nuqs' `createSearchParamsCache` in favor of nuqs' `createLoader`.

## Migration instructions:

- Update `/(facted)/category/[slug]/page.tsx`
  - For this page we are now doing a blocking request for category page data. Instead of having functions that each would read from props, we share streamable functions that can be passed to our UI components. We still stream in filter and product data.
- Update `/(facted)/category/[slug]/page-data.tsx`
  - Request now accept `customerAccessToken` as a prop instead of calling internally.
- Update`/(facted)/category/[slug]/fetch-compare-products.ts`
  - Request now accept `customerAccessToken` as a prop instead of calling internally.
- Update `/(faceted)/fetch-faceted-search.ts`
  - Request now accept `customerAccessToken` and `currencyCode` as a prop instead of calling internally.
