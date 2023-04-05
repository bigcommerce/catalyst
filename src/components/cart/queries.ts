import { gql } from '@apollo/client';

import { LineItems, physicalItemsFragment } from '../../pages/fragments';

export interface GetCartQuery {
  site: {
    cart: {
      entityId: string;
      currencyCode: string;
      isTaxIncluded: boolean;
      amount: {
        currencyCode: string;
        value: number;
      };
      lineItems: LineItems;
    };
  };
}

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
