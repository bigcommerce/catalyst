---
"@bigcommerce/catalyst-core": patch
---

Add pagination support for the product gallery. When a product has more images than the initial page load, a "load more" button appears in the thumbnail strip to fetch additional images on demand.

## Changed Files

- `core/app/[locale]/(default)/product/[slug]/_actions/get-more-images.ts` (new)
- `core/app/[locale]/(default)/product/[slug]/page-data.ts`
- `core/app/[locale]/(default)/product/[slug]/page.tsx`
- `core/vibes/soul/sections/product-detail/index.tsx`
- `core/vibes/soul/sections/product-detail/product-gallery.tsx`
- `core/messages/en.json`

## Migration

1. Create the new server action file `core/app/[locale]/(default)/product/[slug]/_actions/get-more-images.ts` with a GraphQL query to fetch additional product images with pagination.

2. Update the product page data fetching in `core/app/[locale]/(default)/product/[slug]/page-data.ts` to include `pageInfo` (with `hasNextPage` and `endCursor`) from the images query.

3. Update `core/app/[locale]/(default)/product/[slug]/page.tsx` to pass the new pagination props (`pageInfo`, `productId`, `loadMoreAction`, `loadMoreLabel`) to the `ProductDetail` component.

4. The `ProductGallery` component now accepts optional props for pagination:
   - `pageInfo?: { hasNextPage: boolean; endCursor: string | null }`
   - `productId?: number`
   - `loadMoreAction?: ProductGalleryLoadMoreAction`

Due to the number of changes, it is recommended to use the PR as a reference for migration.
