'use client';

import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { useEffect, useRef } from 'react';

import { FragmentOf } from '~/client/graphql';
import { ProductCardFragment } from '~/components/product-card/fragment';
import { TaxDisplay } from '~/data-transformers/prices-transformer';
import { useAnalytics } from '~/lib/analytics/react';
import { pickPricesForTaxDisplay } from '~/lib/tax-pricing';

import { getCategoryPageData } from '../page-data';

type Category = Awaited<ReturnType<typeof getCategoryPageData>>['category'];
type productSearchItem = FragmentOf<typeof ProductCardFragment>;

interface Props {
  category: NonNullable<Category>;
  products: productSearchItem[];
  taxDisplay?: TaxDisplay | null;
}

export const CategoryViewed = ({ category, products, taxDisplay }: Props) => {
  const isMounted = useRef(false);
  const analytics = useAnalytics();

  useEffect(() => {
    if (isMounted.current) {
      return;
    }

    isMounted.current = true;

    const firstProductPrices = products[0]
      ? pickPricesForTaxDisplay(products[0], taxDisplay)
      : undefined;

    analytics?.navigation.categoryViewed({
      id: category.entityId,
      name: category.name,
      currency: firstProductPrices?.price.currencyCode || 'USD',
      items: products.map((p) => {
        const prices = pickPricesForTaxDisplay(p, taxDisplay);

        return {
          id: p.entityId.toString(),
          name: p.name,
          brand: p.brand?.name,
          price: prices?.price.value,
          categories: removeEdgesAndNodes(category.breadcrumbs).map(({ name }) => name),
        };
      }),
    });
  }, [analytics, category, products, taxDisplay]);

  return null;
};
