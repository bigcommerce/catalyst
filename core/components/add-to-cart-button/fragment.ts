import { graphql } from '~/client/graphql';

export const AddToCartButtonFragment = graphql(`
  fragment AddToCartButtonFragment on Product {
    inventory {
      hasVariantInventory
      isInStock
    }
    availabilityV2 {
      status
    }
  }
`);
