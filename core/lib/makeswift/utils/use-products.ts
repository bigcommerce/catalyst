import { useMemo } from 'react';
import useSWR from 'swr';
import { z } from 'zod';

import {
  BcProductSchema,
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

export function useProducts({ collection, collectionLimit = 20, additionalProductIds }: Props) {
  const bcProductToVibesProduct = useBcProductToVibesProduct();

  const { data: collectionData, isLoading: isCollectionLoading } = useSWR(
    collection !== 'none' ? `/api/products/group/${collection}` : null,
    fetcher,
  );

  const searchParams = new URLSearchParams();

  searchParams.append('ids', additionalProductIds.join(','));

  const additionalProductsUrl = `/api/products/ids?${searchParams.toString()}`;

  const { data: additionalData, isLoading: isAdditionalLoading } = useSWR(
    additionalProductIds.length ? additionalProductsUrl : null,
    fetcher,
  );

  const combinedProducts = useMemo(
    () => [
      ...(collectionData?.products.slice(0, collectionLimit) ?? []),
      ...(additionalData?.products ?? []),
    ],
    [collectionData, additionalData, collectionLimit],
  );

  const isLoading = isCollectionLoading || isAdditionalLoading;

  const products = useMemo(
    () => (isLoading ? null : combinedProducts.map(bcProductToVibesProduct)),
    [isLoading, combinedProducts, bcProductToVibesProduct],
  );

  return { products, isLoading };
}
