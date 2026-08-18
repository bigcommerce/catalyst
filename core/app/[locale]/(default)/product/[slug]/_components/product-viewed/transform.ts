import { FragmentOf } from '~/client/graphql';

import { ProductViewedFragment } from './fragment';

export const productItemTransform = (p: FragmentOf<typeof ProductViewedFragment>) => {
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
