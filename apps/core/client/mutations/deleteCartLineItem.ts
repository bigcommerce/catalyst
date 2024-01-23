import { getSessionCustomerId } from '~/auth';

import { client } from '..';
import { graphql } from '../generated';

export const DELETE_CART_LINE_ITEM = /* GraphQL */ `
  mutation DeleteCartLineItem($input: DeleteCartLineItemInput!) {
    cart {
      deleteCartLineItem(input: $input) {
        cart {
          entityId
        }
      }
    }
  }
`;

export const deleteCartLineItem = async (cartEntityId: string, lineItemEntityId: string) => {
  const mutation = graphql(DELETE_CART_LINE_ITEM);
  const customerId = await getSessionCustomerId();

  const response = await client.fetch({
    document: mutation,
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
