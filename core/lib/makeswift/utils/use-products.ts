import { useLocale } from 'next-intl';
import { useMemo } from 'react';
import useSWR from 'swr';
import { z } from 'zod';

import { useProductsViewer } from '../products-viewer';

import { getCollectionProductsUrl, getProductsByIdsUrl } from './products-api';
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

  const viewer = useProductsViewer();

  const { data: collectionData, isLoading: isCollectionLoading } = useSWR(
    collection !== 'none' ? getCollectionProductsUrl(collection, locale, viewer) : null,
    fetcher,
  );

  const { data: additionalData, isLoading: isAdditionalLoading } = useSWR(
    getProductsByIdsUrl(additionalProductIds, locale, viewer),
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
