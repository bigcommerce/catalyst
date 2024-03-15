import { getSessionCustomerId } from '~/auth';

import { client } from '..';
import { AddCartLineItemsDataInput } from '../generated/graphql';
import { graphql } from '../graphql';

const ADD_TO_CART_LINE_ITEM_MUTATION = graphql(`
  mutation AddCartLineItem($input: AddCartLineItemsInput!) {
    cart {
      addCartLineItems(input: $input) {
        cart {
          entityId
        }
      }
    }
  }
`);

export const addCartLineItem = async (cartEntityId: string, data: AddCartLineItemsDataInput) => {
  const customerId = await getSessionCustomerId();

  const response = await client.fetch({
    document: ADD_TO_CART_LINE_ITEM_MUTATION,
    variables: { input: { cartEntityId, data } },
    customerId,
    fetchOptions: { cache: 'no-store' },
  });

  return response.data.cart.addCartLineItems?.cart;
};
