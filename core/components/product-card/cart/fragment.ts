import { graphql, ResultOf } from '~/client/graphql';

export const CartFragment = graphql(`
  fragment CartFragment on Product {
    entityId
    productOptions(first: 10) {
      edges {
        node {
          entityId
        }
      }
    }
  }
`);

export type CartFragmentResult = ResultOf<typeof CartFragment>;
