import { graphql } from '~/client/graphql';

import { ProductCardFragment } from '../product-card/fragment';

export const FeaturedProductsListFragment = graphql(
  `
    fragment FeaturedProductsListFragment on Product {
      ...ProductCardFragment
    }
  `,
  [ProductCardFragment],
);
