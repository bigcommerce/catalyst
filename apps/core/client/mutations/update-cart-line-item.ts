import { getSessionCustomerId } from '~/auth';

import { client } from '..';
import { UpdateCartLineItemDataInput } from '../generated/graphql';
import { graphql } from '../graphql';

const UPDATE_CART_LINE_ITEM_MUTATION = graphql(`
  mutation UpdateCartLineItem($input: UpdateCartLineItemInput!) {
    cart {
      updateCartLineItem(input: $input) {
        cart {
          entityId
        }
      }
    }
  }
`);

export const updateCartLineItem = async (
  cartEntityId: string,
  lineItemEntityId: string,
  data: UpdateCartLineItemDataInput,
) => {
  const customerId = await getSessionCustomerId();

  const response = await client.fetch({
    document: UPDATE_CART_LINE_ITEM_MUTATION,
    variables: {
      input: {
        cartEntityId,
        lineItemEntityId,
        data,
      },
    },
    customerId,
    fetchOptions: { cache: 'no-store' },
  });

  return response.data.cart.updateCartLineItem?.cart;
};
