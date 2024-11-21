import { graphql } from '~/client/graphql';

import { ProductCardFragment } from '../product-card/fragment';

export const FeaturedProductsCarouselFragment = graphql(
  `
    fragment FeaturedProductsCarouselFragment on Product {
      ...ProductCardFragment
    }
  `,
  [ProductCardFragment],
);
