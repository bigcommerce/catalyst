---
"@bigcommerce/catalyst-core": patch
---

- Fix public wishlist analytics/server error
- Add translation key for a Publish Wishlist empty state

## Migration

### 1. Add the following imports to `core/app/[locale]/(default)/wishlist/[token]/page.tsx`:

```tsx
import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { WishlistAnalyticsProvider } from '~/app/[locale]/(default)/account/wishlists/[id]/_components/wishlist-analytics-provider';
```

### 2. Add the following function into the file:

```tsx
const getAnalyticsData = async (token: string, searchParamsPromise: Promise<SearchParams>) => {
  const searchParamsParsed = searchParamsCache.parse(await searchParamsPromise);
  const wishlist = await getPublicWishlist(token, searchParamsParsed);

  if (!wishlist) {
    return [];
  }

  return removeEdgesAndNodes(wishlist.items)
    .map(({ product }) => product)
    .filter((product) => product !== null)
    .map((product) => {
      return {
        id: product.entityId,
        name: product.name,
        sku: product.sku,
        brand: product.brand?.name ?? '',
        price: product.prices?.price.value ?? 0,
        currency: product.prices?.price.currencyCode ?? '',
      };
    });
};
```

### 3. Wrap the component in the `WishlistAnalyticsProvider`:

```tsx
export default async function PublicWishlist({ params, searchParams }: Props) {
  // ...
  return (
    <WishlistAnalyticsProvider data={Streamable.from(() => getAnalyticsData(token, searchParams))}>
      // ...
    </WishlistAnalyticsProvider>
  );
}
```

### 4. Update `/core/messages/en.json` "PublishWishlist" to have translations:

```json
  "PublicWishlist": {
    "title": "Public Wish List",
    "defaultName": "Public wish list",
    "emptyWishlist": "This wish list doesn't have any products yet."
  },
```

### 5. Update `WishlistDetails` component to accept the `emptyStateText` and `placeholderCount` props:

```tsx
// ...
export const WishlistDetails = ({
  className = '',
  wishlist: streamableWishlist,
  emptyStateText,
  paginationInfo,
  headerActions,
  prevHref,
  placeholderCount,
  action,
  removeAction,
}: Props) => {
```

### 6. Update `WishlistDetails` component to pass the `emptyStateText` and `placeholderCount` props to both the `WishlistDetailSkeleton` and `WishlistItems` components:

```tsx
<WishlistDetailSkeleton
  className={className}
  headerActions={typeof headerActions === 'function' ? headerActions() : headerActions}
  placeholderCount={placeholderCount}
  prevHref={prevHref}
/>
```

```tsx
<WishlistItems
  action={action}
  emptyStateText={emptyStateText}
  items={items}
  placeholderCount={placeholderCount}
  removeAction={removeAction}
  wishlistId={wishlist.id}
/>
```
