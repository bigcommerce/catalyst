import { graphql } from '~/client/graphql';
import { AddToCartButtonFragment } from '~/components/add-to-cart-button/fragment';

export const AddToCartFragment = graphql(
  `
    fragment AddToCartFragment on Product {
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
