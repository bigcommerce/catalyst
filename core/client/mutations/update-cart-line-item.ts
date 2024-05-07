import { getSessionCustomerId } from '~/auth';

import { client } from '..';
import { graphql, VariablesOf } from '../graphql';

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

type Variables = VariablesOf<typeof UPDATE_CART_LINE_ITEM_MUTATION>;
type Input = Variables['input'];

export const updateCartLineItem = async (
  cartEntityId: Input['cartEntityId'],
  lineItemEntityId: Input['lineItemEntityId'],
  data: Input['data'],
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
