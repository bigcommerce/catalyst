import { graphql } from '~/client/graphql';

import { ProductCardFragment } from '../product-card/fragment';

export const ProductsCarouselFragment = graphql(
  `
    fragment ProductsCarouselFragment on Product {
      ...ProductCardFragment
    }
  `,
  [ProductCardFragment],
);
