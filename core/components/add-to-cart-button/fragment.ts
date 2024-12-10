import { graphql } from '~/client/graphql';

export const AddToCartButtonFragment = graphql(`
  fragment AddToCartButtonFragment on Product {
    inventory {
      isInStock
    }
    availabilityV2 {
      status
    }
  }
`);
