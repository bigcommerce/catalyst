import { notFound } from 'next/navigation';

import { WishlistContent, WISHLISTS_PER_PAGE } from './_components/wishlist-content';
import { getWishlists } from './page-data';

interface Props {
  searchParams: {
    [key: string]: string | string[] | undefined;
    action?: 'add-new-address' | 'edit-address';
    before?: string;
    after?: string;
    wishlistId?: string;
  };
}

export default async function AccountTabPage({ searchParams }: Props) {
  const { before, after, wishlistId } = await searchParams;

  if (wishlistId) {
    return <div>wishlistDetails</div>
  }

  const wishlistDetails = await getWishlists({
    ...(after && { after }),
    ...(before && { before }),
    limit: WISHLISTS_PER_PAGE,
  });

  if (!wishlistDetails) {
    notFound();
  }

  return <WishlistContent {...wishlistDetails} />;
}

//export const runtime = 'edge';
