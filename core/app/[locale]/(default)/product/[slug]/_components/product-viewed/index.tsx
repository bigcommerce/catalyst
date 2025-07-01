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

    analytics?.navigation.productViewed({
      value: product.prices?.price.value ?? 0,
      currency: product.prices?.price.currencyCode ?? 'USD',
      items: [
        {
          id: product.entityId.toString(),
          name: product.name,
          brand: product.brand?.name,
          sku: product.sku,
          price: product.prices?.salePrice?.value,
        },
      ],
    });
  }, [analytics, product]);

  return null;
};
