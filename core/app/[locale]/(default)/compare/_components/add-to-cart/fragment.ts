import { graphql } from '~/client/graphql';
import { AddToCartButtonFragment } from '~/components/add-to-cart-button/fragment';

export const CartFragment = graphql(
  `
    fragment CartFragment on Product {
      entityId
      ...AddToCartButtonFragment
    }
  `,
  [AddToCartButtonFragment],
);
