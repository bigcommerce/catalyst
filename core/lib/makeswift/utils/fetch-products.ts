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
  productIds: string[];
}

export function useProductsByIds({ productIds }: Props) {
  const bcProductToVibesProduct = useBcProductToVibesProduct();

  const searchParams = new URLSearchParams();

  searchParams.append('ids', productIds.join(','));

  const productByIdsUrl = `/api/products/ids?${searchParams.toString()}&include_fields=reviews_rating_sum,reviews_count`;

  const { data, isLoading } = useSWR(productIds.length ? productByIdsUrl : null, fetcher);

  //   const combinedProducts = useMemo(() => [...(data?.products ?? [])], [data]);

  //   const products = useMemo(
  //     () => (isLoading ? null : combinedProducts.map(bcProductToVibesProduct)),
  //     [isLoading, combinedProducts, bcProductToVibesProduct],
  //   );

  // Remove useMemo, compute directly
  const combinedProducts = data?.products ?? [];
  const products = isLoading ? null : combinedProducts.map(bcProductToVibesProduct);

  return { products, isLoading };
}
