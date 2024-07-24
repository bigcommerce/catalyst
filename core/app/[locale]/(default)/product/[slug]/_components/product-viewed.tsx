'use client';

import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { useEffect } from 'react';

import { ProductItemFragment } from '~/client/fragments/product-item';
import { FragmentOf } from '~/client/graphql';
import { bodl } from '~/lib/bodl';

interface Props {
  product: FragmentOf<typeof ProductItemFragment>;
}

const productItemTransform = (p: FragmentOf<typeof ProductItemFragment>) => {
  const category = removeEdgesAndNodes(p.categories).at(0);
  const breadcrumbs = category ? removeEdgesAndNodes(category.breadcrumbs) : [];

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
    category_names: breadcrumbs.map(({ name }) => name),
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
