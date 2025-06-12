'use client';

import { ComponentPropsWithoutRef } from 'react';

import { ProductCarousel, ProductsCarouselSkeleton } from '@/vibes/soul/sections/product-carousel';

import { useProducts } from '../../utils/use-products';

type MSProductsCarouselProps = Omit<
  ComponentPropsWithoutRef<typeof ProductCarousel>,
  'products'
> & {
  className: string;
  collection: 'none' | 'best-selling' | 'newest' | 'featured';
  limit: number;
  additionalProducts: Array<{
    entityId?: string;
  }>;
};

export function MSProductsCarousel({
  className,
  collection,
  limit,
  additionalProducts,
  hideOverflow,
  ...props
}: MSProductsCarouselProps) {
  const additionalProductIds = additionalProducts.map(({ entityId }) => entityId ?? '');
  const { products, isLoading } = useProducts({
    collection,
    collectionLimit: limit,
    additionalProductIds,
  });

  if (isLoading) {
    return <ProductsCarouselSkeleton className={className} hideOverflow={hideOverflow} />;
  }

  if (products == null || products.length === 0) {
    return <ProductsCarouselSkeleton className={className} hideOverflow={hideOverflow} />;
  }

  return (
    <ProductCarousel
      {...props}
      className={className}
      hideOverflow={hideOverflow}
      products={products}
    />
  );
}
