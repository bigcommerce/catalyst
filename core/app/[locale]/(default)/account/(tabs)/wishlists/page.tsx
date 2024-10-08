import { notFound } from 'next/navigation';

import { WishlistContent, WISHLISTS_PER_PAGE } from './_components/wishlist-content';
import { WishlistDetails } from './_components/wishlist-details';
import { getWishlist, getWishlists } from './page-data';

interface Props {
  searchParams: {
    [key: string]: string | string[] | undefined;
    action?: 'add-new-address' | 'edit-address';
    before?: string;
    after?: string;
    wishlistId?: string;
  };
}

export default async function WishlistsPage({ searchParams }: Props) {
  const { before, after, wishlistId } = searchParams;

  if (wishlistId) {
    const wishlistData = await getWishlist({
      ...(after && { after }),
      ...(before && { before }),
      filters: { entityIds: [Number(wishlistId)] },
    });

    const wishlistItem = wishlistData?.wishlists[0];

    if (!wishlistItem) {
      notFound();
    } else {
      return <WishlistDetails data={wishlistItem} />;
    }
  }

  const wishlistsData = await getWishlists({
    ...(after && { after }),
    ...(before && { before }),
    limit: WISHLISTS_PER_PAGE,
  });

  if (!wishlistsData) {
    notFound();
  }

  return <WishlistContent {...wishlistsData} />;
}

export const runtime = 'edge';
