'use client';

import { useEffect } from 'react';

import { ProductItemFragment } from '~/client/fragments/product-item';
import { FragmentOf } from '~/client/graphql';
import { bodl, productItemTransform } from '~/lib/bodl';

interface Props {
  product: FragmentOf<typeof ProductItemFragment>;
}

export const ProductViewed = ({ product }: Props) => {
  useEffect(() => {
    const transformedProduct = productItemTransform(product);

    bodl.navigation.productViewed({
      product_value: transformedProduct.purchase_price,
      currency: transformedProduct.currency,
      line_items: [transformedProduct],
    });
  }, [product]);

  return null;
};
