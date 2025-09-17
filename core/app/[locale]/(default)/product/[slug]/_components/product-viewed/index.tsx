'use client';

import { useEffect, useRef } from 'react';

import { PricingFragment } from '~/client/fragments/pricing';
import { FragmentOf } from '~/client/graphql';
import { useAnalytics } from '~/lib/analytics/react';

import { ProductViewedFragment } from './fragment';

interface Props {
  product: FragmentOf<typeof ProductViewedFragment> & FragmentOf<typeof PricingFragment>;
}

export const ProductViewed = ({ product }: Props) => {
  const isMounted = useRef(false);
  const analytics = useAnalytics();

  useEffect(() => {
    if (isMounted.current) {
      return;
    }

    isMounted.current = true;

    const productPrice = product.pricesExcTax ?? product.pricesIncTax;

    analytics?.navigation.productViewed({
      value: productPrice?.price.value ?? 0,
      currency: productPrice?.price.currencyCode ?? 'USD',
      items: [
        {
          id: product.entityId.toString(),
          name: product.name,
          brand: product.brand?.name,
          sku: product.sku,
          price: productPrice?.salePrice?.value,
        },
      ],
    });
  }, [analytics, product]);

  return null;
};
