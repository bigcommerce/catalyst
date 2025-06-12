'use client';

import { useLocale } from 'next-intl';
import useSWR from 'swr';

import {
  BcProductSchema,
  useBcProductToVibesProduct,
} from '~/lib/makeswift/utils/use-bc-product-to-vibes-product/use-bc-product-to-vibes-product';
import { ProductCard, ProductCardSkeleton } from '~/vibes/soul/primitives/product-card';

interface Props {
  className?: string;
  entityId?: string;
  aspectRatio: '1:1' | '5:6' | '3:4';
  colorScheme: 'light' | 'dark';
  badge: { show: boolean; text: string };
  showCompare?: boolean;
}

export function MakeswiftProductCard({ className, entityId, badge, ...props }: Props) {
  const bcProductToVibesProduct = useBcProductToVibesProduct();
  const locale = useLocale();
  const { data, isLoading } = useSWR(
    entityId ? `/api/products/${entityId}?locale=${locale}` : null,
    async (url) =>
      fetch(url)
        .then((r) => r.json())
        .then(BcProductSchema.parse),
  );

  if (entityId == null || isLoading || data == null) {
    return <ProductCardSkeleton className={className} />;
  }

  const product = bcProductToVibesProduct(data);

  return (
    <ProductCard
      className={className}
      product={{
        ...product,
        badge: badge.show ? badge.text : undefined,
      }}
      {...props}
    />
  );
}
