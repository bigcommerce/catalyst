import React from 'react';

import { WishlistProductCard } from './wishlist-products-card';
import { getWishlists } from '../page-data';

interface PageProps {
  params: { locale: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function WishlistProductPage({ params, searchParams }: PageProps) {
  const cursor = typeof searchParams?.cursor === 'string' ? searchParams.cursor : undefined;

  // Pass the required parameters to getWishlists
  const wishlistsData = await getWishlists({
    first: 10, // Or whatever number you want to fetch
    after: cursor,
    imageHeight: 300,
    imageWidth: 300,
  });

  // Extract just the wishlists array from the response
  const wishlists = wishlistsData?.wishlists ?? [];

  return (
    <div className="container mx-auto px-4">
      <h1 className="mb-6 text-2xl font-bold">Your Wishlist Products</h1>
      <WishlistProductCard initialWishlists={wishlists} />
    </div>
  );
}
