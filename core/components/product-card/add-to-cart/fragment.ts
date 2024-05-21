import { graphql } from '~/client/graphql';

export const CartFragment = graphql(`
  fragment CartFragment on Product {
    entityId
    productOptions(first: 3) {
      edges {
        node {
          entityId
        }
      }
    }
    inventory {
      isInStock
    }
  }
`);
