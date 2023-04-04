import { gql } from '@apollo/client';

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
              entityId
              imageUrl
              name
              quantity
              extendedListPrice {
                currencyCode
                value
              }
              listPrice {
                value
              }
              url
            }
          }
        }
      }
    }
  }
`;
