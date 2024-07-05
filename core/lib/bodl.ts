import { Bodl } from '@bigcommerce/bodl';
import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';

import { ProductItemFragment } from '~/client/fragments/product-item';
import { FragmentOf } from '~/client/graphql';

export const bodl = Bodl.init({
  channel_id: Number(process.env.BIGCOMMERCE_CHANNEL_ID ?? 1),
  // TODO: Replace with actual store configuration
  ga4: {
    gaId: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS ?? '',
    developerId: 0,
    consentModeEnabled: false,
  },
});

export const productItemTransform = (p: FragmentOf<typeof ProductItemFragment>) => {
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
