import { graphql } from '~/client/graphql';

export const CartFragment = graphql(`
  fragment CartFragment on Product {
    entityId
    name
    inventory {
      isInStock
    }
  }
`);
