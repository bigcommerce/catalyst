---
"@bigcommerce/catalyst-core": patch
---

This refactor optimizes PDP for caching and the eventual use of dynamicIO.

Key modifications include:

- Split queries into four:
  - Metadata (metadata fields that only depend on locale)
  - Base Product (for fields that only depend on locale)
  - Product (for fields that depend on locale and variant selection)
  - Extended Product (for fields that require locale, variant selection, and currency)
- We don't stream in Base Product data, instead it's a blocking call that will redirect to `notFound` when product is not found.
- Our query functions now take in all params required for fetching, instead of accessing dynamic variables internally. This is important to serialize arguments if we want to eventually `use cache`.
- Use `Streamable.from` to generate our streaming props that are passed to our UI components.
- Update UI components to allow streaming product options before streaming in buy button.

  With these changes we leverage data caching to hit mostly cache data for guest shoppers in different locales and with different currencies.

  Migration instructions:

1. Update `/product/[slug]/page.tsx`, `/product/[slug]/page-data.tsx`, `/product/[slug]/_components`.
2. Update `/vibes/soul/product-detail/index.tsx` & `/vibes/soul/product-detail/product-detail-form.tsx`
