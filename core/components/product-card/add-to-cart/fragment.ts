import { graphql } from '~/client/graphql';
import { AddToCartButtonFragment } from '~/components/add-to-cart-button/fragment';

export const CartFragment = graphql(
  `
    fragment CartFragment on Product {
      entityId
      productOptions(first: 3) {
        edges {
          node {
            entityId
          }
        }
      }
      ...AddToCartButtonFragment
    }
  `,
  [AddToCartButtonFragment],
);
