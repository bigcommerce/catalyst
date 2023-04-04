import { gql } from '@apollo/client';

export const deleteCartLineItemMutation = gql`
  mutation deleteCartLineItem($deleteCartLineItemInput: DeleteCartLineItemInput!) {
    cart {
      deleteCartLineItem(input: $deleteCartLineItemInput) {
        deletedLineItemEntityId
        cart {
          entityId
          lineItems {
            totalQuantity
          }
        }
        deletedCartEntityId
      }
    }
  }
`;
