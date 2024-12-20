import React from 'react';

import { getWishlists } from '../page-data';
import { WishlistClientWrapper } from './wishlist-wrapper';

interface PageProps {
  params: { locale: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function WishlistProductPage({ params, searchParams }: PageProps) {
  const cursor = typeof searchParams?.cursor === 'string' ? searchParams.cursor : undefined;

  const wishlistsData = await getWishlists({
    first: 10,
    after: cursor,
    imageHeight: 300,
    imageWidth: 300,
  });

  const wishlists = wishlistsData?.wishlists ?? [];

  return (
    <div className="container mx-auto px-4">
      <h1 className="mb-6 text-2xl font-bold">Your Wishlist Products</h1>
      <WishlistClientWrapper wishlists={wishlists} />
    </div>
  );
}
