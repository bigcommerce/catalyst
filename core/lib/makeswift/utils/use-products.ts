import { useLocale } from 'next-intl';
import { useMemo } from 'react';
import useSWR from 'swr';
import { z } from 'zod';

import {
  BcProductSchema,
  Product,
  useBcProductToVibesProduct,
} from './use-bc-product-to-vibes-product/use-bc-product-to-vibes-product';

const ProductListSchema = z.object({
  products: z.array(BcProductSchema),
});

const fetcher = (url: string) =>
  fetch(url)
    .then((res) => res.json())
    .then(ProductListSchema.parse);

interface Props {
  collection: 'none' | 'best-selling' | 'newest' | 'featured';
  collectionLimit?: number;
  additionalProductIds: string[];
}

export function useProducts({ collection, collectionLimit = 20, additionalProductIds }: Props): {
  products: Product[] | null;
  isLoading: boolean;
} {
  const bcProductToVibesProduct = useBcProductToVibesProduct();
  const locale = useLocale();

  const { data: collectionData, isLoading: isCollectionLoading } = useSWR(
    collection !== 'none' ? `/api/products/group/${collection}?locale=${locale}` : null,
    fetcher,
  );

  const searchParams = new URLSearchParams();

  searchParams.append('ids', additionalProductIds.join(','));
  searchParams.append('locale', locale);

  const additionalProductsUrl = `/api/products/ids?${searchParams.toString()}`;

  const { data: additionalData, isLoading: isAdditionalLoading } = useSWR(
    additionalProductIds.length ? additionalProductsUrl : null,
    fetcher,
  );
  const additionalProducts = useMemo(
    () =>
      additionalProductIds
        .map((id) => additionalData?.products.find((product) => product.entityId.toString() === id))
        .filter((product) => product != null),
    [additionalData, additionalProductIds],
  );

  const combinedProducts = useMemo(
    () => [...(collectionData?.products.slice(0, collectionLimit) ?? []), ...additionalProducts],
    [collectionData, additionalProducts, collectionLimit],
  );

  const isLoading = isCollectionLoading || isAdditionalLoading;

  const products = useMemo(
    () => (isLoading ? null : combinedProducts.map(bcProductToVibesProduct)),
    [isLoading, combinedProducts, bcProductToVibesProduct],
  );

  return { products, isLoading };
}
