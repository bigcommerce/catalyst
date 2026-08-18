'use client';

import { useEffect } from 'react';

import { FragmentOf } from '~/client/graphql';
import { bodl } from '~/lib/bodl';

import { ProductViewedFragment } from './fragment';
import { productItemTransform } from './transform';

interface Props {
  product: FragmentOf<typeof ProductViewedFragment>;
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
