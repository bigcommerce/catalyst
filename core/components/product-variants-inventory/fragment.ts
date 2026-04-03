import { graphql } from '~/client/graphql';

export const ProductVariantsInventoryFragment = graphql(`
  fragment ProductVariantsInventoryFragment on Product {
    variants {
      edges {
        node {
          entityId
          sku
          inventory {
            byLocation {
              edges {
                node {
                  locationEntityId
                  backorderMessage
                }
              }
            }
          }
        }
      }
    }
  }
`);
