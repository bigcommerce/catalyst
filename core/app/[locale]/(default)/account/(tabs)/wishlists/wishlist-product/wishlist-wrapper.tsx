'use client';

import React from 'react';
import { WishlistProductCard } from './wishlist-products-card';

interface WishlistClientWrapperProps {
  wishlists: any[];
}

export function WishlistClientWrapper({ wishlists }: WishlistClientWrapperProps) {
  const handleCompare = (productId: number, checked: boolean) => {
    console.log('Compare:', { productId, checked });
  };

  const handleRemove = (productId: number) => {
    console.log('Remove from wishlist:', productId);
  };

  const handleColorSelect = (productId: number, variant: any) => {
    console.log('Color selected:', { productId, variant });
  };

  const handleItemsCountChange = (count: number) => {
    console.log('Wishlist items count:', count);
  };

  return (
    <WishlistProductCard
      initialWishlists={wishlists}
      onCompare={handleCompare}
      onRemove={handleRemove}
      onColorSelect={handleColorSelect}
      onItemsCountChange={handleItemsCountChange}
    />
  );
}
