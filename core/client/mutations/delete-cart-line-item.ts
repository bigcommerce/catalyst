import { getSessionCustomerAccessToken } from '~/auth';

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
  const customerAccessToken = await getSessionCustomerAccessToken();

  const response = await client.fetch({
    document: DELETE_CART_LINE_ITEM,
    variables: {
      input: {
        cartEntityId,
        lineItemEntityId,
      },
    },
    customerAccessToken,
    fetchOptions: { cache: 'no-store' },
  });

  return response.data.cart.deleteCartLineItem?.cart;
};
