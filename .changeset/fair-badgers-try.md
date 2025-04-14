---
"@bigcommerce/catalyst-core": patch
---

## New

This refactor optimizes PDP for caching and the eventual use of dynamicIO. With these changes we leverage data caching to hit mostly cache data for guest shoppers in different locales and with different currencies.

## Key modifications include:

- Split queries into four:
  - Metadata (metadata fields that only depend on locale)
  - Base Product (for fields that only depend on locale)
  - Extended Product (for fields that depend on locale and variant selection)
  - Pricing and Related Products (for fields that require locale, variant selection, and currency -- in this case, pricing and related products)
- We don't stream in Base Product data, instead it's a blocking call that will redirect to `notFound` when product is not found.
- Our query functions now take in all params required for fetching, instead of accessing dynamic variables internally. This is important to serialize arguments if we want to eventually `use cache`.
- Use `Streamable.from` to generate our streaming props that are passed to our UI components.
- Update UI components to allow streaming product options before streaming in buy button.

## Migration instructions:

- Update `/product/[slug]/page.tsx`
  - For this page we are now doing a blocking request that is simplified for metadata and as a base product. Instead of having functions that each would read from props, we share streamable functions that can be passed to our UI components.
- Update `/product/[slug]/page-data.tsx`
  - Expect our requests to be simplified/merged, essentially replacing what we had before for new requests and functions.
- Update`/product/[slug]/_components`.
  - Similar to `page.tsx` and `page.data`, expect changes in the fragments defined and how we pass streamable functions to UI components.
- Update `/vibes/soul/product-detail/index.tsx` & `/vibes/soul/product-detail/product-detail-form.tsx`
  - Minor changes to allow streaming in data.
