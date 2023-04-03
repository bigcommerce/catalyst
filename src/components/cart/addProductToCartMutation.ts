import { gql } from '@apollo/client';

export const addProductToCartMutation2 = gql`
  mutation createCart($input: CreateCartInput!) {
    cart {
      createCart(input: $input) {
        cart {
          entityId
          currencyCode
          isTaxIncluded
        }
      }
    }
  }
`;

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
              name
              quantity
              listPrice {
                value
              }
            }
          }
        }
      }
    }
  }
`;
