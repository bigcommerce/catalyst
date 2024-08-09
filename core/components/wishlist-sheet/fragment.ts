import { graphql } from '~/client/graphql';

export const WishlistSheetFragment = graphql(`
  fragment WishlistSheetFragment on WishlistConnection {
    edges {
      node {
        name
        entityId
        items {
          edges {
            node {
              entityId
              product {
                name
                entityId
              }
            }
          }
        }
      }
    }
  }
`);
