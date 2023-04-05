import { gql } from '@apollo/client';

import { physicalItemsFragment } from '../../pages/fragments';

export const getCartQuery = gql`
  query getCart($entityId: String!) {
    site {
      cart(entityId: $entityId) {
        entityId
        currencyCode
        isTaxIncluded
        amount {
          currencyCode
          value
        }
        lineItems {
          physicalItems {
            ...${physicalItemsFragment.fragmentName}
          }
          totalQuantity
        }
      }
    }
  }
  ${physicalItemsFragment.fragment}
`;
