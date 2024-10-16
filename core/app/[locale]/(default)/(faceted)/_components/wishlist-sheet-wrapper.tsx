'use client';

import { Wishlist, WishlistSheet } from '../../account/(tabs)/wishlists/_components/wishlist-sheet';

import { useWishlistSheetContext } from './wishlist-sheet-context';

interface WishlistSheetWrapperProps {
  wishlistsData: Wishlist[];
}

export const WishlistSheetWrapper = ({ wishlistsData }: WishlistSheetWrapperProps) => {
  const { productId } = useWishlistSheetContext();

  if (!productId) return null;

  return (
    <WishlistSheet
      defaultOpen={true}
      productId={productId}
      wishlistsData={wishlistsData}
      withTrigger={false}
    />
  );
};
