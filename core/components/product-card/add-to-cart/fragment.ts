import { graphql } from '~/client/graphql';
import { AddToCartButtonFragment } from '~/components/add-to-cart-button/fragment';

export const AddToCartFragment = graphql(
  `
    fragment AddToCartFragment on Product {
      entityId
      path
      productOptions(first: 1) {
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
