import { getSessionCustomerId } from '~/auth';

import { client } from '..';
import { graphql } from '../graphql';

const DELETE_CART_LINE_ITEM = graphql(`
  mutation DeleteCartLineItem($input: DeleteCartLineItemInput!) {
    cart {
      deleteCartLineItem(input: $input) {
        cart {
          entityId
        }
      }
    }
  }
`);

export const deleteCartLineItem = async (cartEntityId: string, lineItemEntityId: string) => {
  const customerId = await getSessionCustomerId();

  const response = await client.fetch({
    document: DELETE_CART_LINE_ITEM,
    variables: {
      input: {
        cartEntityId,
        lineItemEntityId,
      },
    },
    customerId,
    fetchOptions: { cache: 'no-store' },
  });

  return response.data.cart.deleteCartLineItem?.cart;
};
