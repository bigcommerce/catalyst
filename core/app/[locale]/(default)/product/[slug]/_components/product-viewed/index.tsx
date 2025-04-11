'use client';

import { useEffect } from 'react';

import { PricingFragment } from '~/client/fragments/pricing';
import { FragmentOf } from '~/client/graphql';
import { bodl } from '~/lib/bodl';

import { ProductViewedFragment } from './fragment';

interface Props {
  product: FragmentOf<typeof ProductViewedFragment> & FragmentOf<typeof PricingFragment>;
}

const productItemTransform = (p: Props['product']) => {
  return {
    product_id: p.entityId.toString(),
    product_name: p.name,
    brand_name: p.brand?.name,
    sku: p.sku,
    sale_price: p.prices?.salePrice?.value,
    purchase_price: p.prices?.salePrice?.value || p.prices?.price.value || 0,
    base_price: p.prices?.price.value,
    retail_price: p.prices?.retailPrice?.value,
    currency: p.prices?.price.currencyCode || 'USD',
    variant_id: p.variants.edges?.map((variant) => variant.node.entityId),
  };
};

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
