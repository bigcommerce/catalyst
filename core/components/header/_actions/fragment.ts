import { graphql } from '~/client/graphql';
import { ProductCardFragment } from '~/components/product-card/fragment';

export const SearchProductFragment = graphql(
  `
    fragment SearchProductFragment on Product {
      categories {
        edges {
          node {
            name
            path
          }
        }
      }
      ...ProductCardFragment
    }
  `,
  [ProductCardFragment],
);
