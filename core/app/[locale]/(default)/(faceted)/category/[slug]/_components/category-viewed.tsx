'use client';

import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { useEffect, useRef } from 'react';

import { FragmentOf } from '~/client/graphql';
import { ProductCardFragment } from '~/components/product-card/fragment';
import { useAnalytics } from '~/lib/analytics/react';

import { getCategoryPageData } from '../page-data';

type Category = Awaited<ReturnType<typeof getCategoryPageData>>['category'];
type productSearchItem = FragmentOf<typeof ProductCardFragment>;

interface Props {
  category: NonNullable<Category>;
  products: productSearchItem[];
}

export const CategoryViewed = ({ category, products }: Props) => {
  const isMounted = useRef(false);
  const analytics = useAnalytics();

  useEffect(() => {
    if (isMounted.current) {
      return;
    }

    isMounted.current = true;

    analytics?.navigation.categoryViewed({
      id: category.entityId,
      name: category.name,
      currency: products[0]?.prices?.price.currencyCode || 'MXN',
      items: products.map((p) => {
        return {
          id: p.entityId.toString(),
          name: p.name,
          brand: p.brand?.name,
          price: p.prices?.price.value,
          categories: removeEdgesAndNodes(category.breadcrumbs).map(({ name }) => name),
        };
      }),
    });
  }, [analytics, category, products]);

  return null;
};
