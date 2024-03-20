import { getSessionCustomerId } from '~/auth';

import { client } from '..';
import { graphql, VariablesOf } from '../graphql';

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

type Variables = VariablesOf<typeof ADD_TO_CART_LINE_ITEM_MUTATION>;
type Input = Variables['input'];

export const addCartLineItem = async (cartEntityId: Input['cartEntityId'], data: Input['data']) => {
  const customerId = await getSessionCustomerId();

  const response = await client.fetch({
    document: ADD_TO_CART_LINE_ITEM_MUTATION,
    variables: { input: { cartEntityId, data } },
    customerId,
    fetchOptions: { cache: 'no-store' },
  });

  return response.data.cart.addCartLineItems?.cart;
};
