---
"@bigcommerce/catalyst-core": patch
---

- Redirect to `/account/wishlists/` when a wishlist ID is not found
- Pass `actionsTitle` to WishlistActionsMenu on WishlistDetails page

## Migration
1. Copy changes from `/core/app/[locale]/(default)/account/wishlists/[id]/_components/wishlist-actions.tsx` - Ensure that `actionsTitle` is an allowed property and that it is passed into the `WishlistActionsMenu` component
2. Copy changes from `/core/app/[locale]/(default)/account/wishlists/[id]/page.tsx` - Redirect to `/account/wishlists/` on 404
3. Ensure that the `removeButtonTitle` prop is passed down all the way to the `RemoveWishlistItemButton` component in the `WishlistItemCard` component
