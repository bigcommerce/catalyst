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

export interface getCartIdQuery {
  site: {
    cart: {
      entityId: string;
    };
  };
}

export const getCartIdQuery = gql`
  query getCartId {
    site {
      cart {
        entityId
      }
    }
  }
`;

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
