---
"@bigcommerce/catalyst-core": minor
---

Add pagination support for the product gallery. When a product has more images than the initial page load, new images will load as batches once the user reaches the end of the existing thumbnails. Thumbnail images now will display in horizontal direction in all viewport sizes.

## Migration

1. Create the new server action file `core/app/[locale]/(default)/product/[slug]/_actions/get-more-images.ts` with a GraphQL query to fetch additional product images with pagination.

2. Update the product page data fetching in `core/app/[locale]/(default)/product/[slug]/page-data.ts` to include `pageInfo` (with `hasNextPage` and `endCursor`) from the images query.

3. Update `core/app/[locale]/(default)/product/[slug]/page.tsx` to pass the new pagination props (`pageInfo`, `productId`, `loadMoreAction`) to the `ProductDetail` component.

4. The `ProductGallery` component now accepts optional props for pagination:
   - `pageInfo?: { hasNextPage: boolean; endCursor: string | null }`
   - `productId?: number`
   - `loadMoreAction?: ProductGalleryLoadMoreAction`

Due to the number of changes, it is recommended to use the PR as a reference for migration.
