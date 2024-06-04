'use client';

import { FragmentOf } from 'gql.tada';
import { useEffect } from 'react';

import { useAnalytics } from '~/app/contexts/analytics-context';

import { ProductViewedFragment } from './fragment';

interface Props {
  product: FragmentOf<typeof ProductViewedFragment>;
}

export const ProductViewed = ({ product }: Props) => {
  const analytics = useAnalytics();

  useEffect(() => {
    analytics.navigation.productViewed({ product });
  }, [analytics.navigation, product]);

  return null;
};
