'use client';

import { useEffect, useRef } from 'react';

import { PricingFragment } from '~/client/fragments/pricing';
import { FragmentOf } from '~/client/graphql';
import { TaxDisplay } from '~/data-transformers/prices-transformer';
import { useAnalytics } from '~/lib/analytics/react';
import { pickPricesForTaxDisplay } from '~/lib/tax-pricing';

import { ProductViewedFragment } from './fragment';

interface Props {
  product: FragmentOf<typeof ProductViewedFragment> & FragmentOf<typeof PricingFragment>;
  taxDisplay?: TaxDisplay | null;
}

export const ProductViewed = ({ product, taxDisplay }: Props) => {
  const isMounted = useRef(false);
  const analytics = useAnalytics();

  useEffect(() => {
    if (isMounted.current) {
      return;
    }

    isMounted.current = true;

    const prices = pickPricesForTaxDisplay(product, taxDisplay);

    analytics?.navigation.productViewed({
      value: prices?.price.value ?? 0,
      currency: prices?.price.currencyCode ?? 'USD',
      items: [
        {
          id: product.entityId.toString(),
          name: product.name,
          brand: product.brand?.name,
          sku: product.sku,
          price: prices?.salePrice?.value,
        },
      ],
    });
  }, [analytics, product, taxDisplay]);

  return null;
};
