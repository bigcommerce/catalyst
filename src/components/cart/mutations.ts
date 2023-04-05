import { gql } from '@apollo/client';

import { physicalItemsFragment } from '../../pages/fragments';

export const addProductToCartMutation = gql`
  mutation addCartLineItems($addCartLineItemsInput: AddCartLineItemsInput!) {
    cart {
      addCartLineItems(input: $addCartLineItemsInput) {
        cart {
          entityId
          amount {
            value
          }
          lineItems {
            totalQuantity
            physicalItems {
              ...${physicalItemsFragment.fragmentName}
            }
          }
        }
      }
    }
  }
  ${physicalItemsFragment.fragment}
`;

export const createCartMutation = gql`
  mutation createCartSimple($createCartInput: CreateCartInput!) {
    cart {
      createCart(input: $createCartInput) {
        cart {
          entityId
          lineItems {
            physicalItems {
              ...${physicalItemsFragment.fragmentName}
            }
          }
        }
      }
    }
  }
  ${physicalItemsFragment.fragment}
`;

export const deleteCartLineItemMutation = gql`
  mutation deleteCartLineItem($deleteCartLineItemInput: DeleteCartLineItemInput!) {
    cart {
      deleteCartLineItem(input: $deleteCartLineItemInput) {
        deletedLineItemEntityId
        cart {
          entityId
          lineItems {
            physicalItems {
              ...${physicalItemsFragment.fragmentName}
            }
            totalQuantity
          }
        }
        deletedCartEntityId
      }
    }
  }
  ${physicalItemsFragment.fragment}
`;
