import { getSessionCustomerAccessToken } from '~/auth';

import { client } from '..';
import { graphql, VariablesOf } from '../graphql';

const AddCartLineItemMutation = graphql(`
  mutation AddCartLineItemMutation($input: AddCartLineItemsInput!) {
    cart {
      addCartLineItems(input: $input) {
        cart {
          entityId
        }
      }
    }
  }
`);

type Variables = VariablesOf<typeof AddCartLineItemMutation>;
type AddCartLineItemsInput = Variables['input'];

export const addCartLineItem = async (
  cartEntityId: AddCartLineItemsInput['cartEntityId'],
  data: AddCartLineItemsInput['data'],
) => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const response = await client.fetch({
    document: AddCartLineItemMutation,
    variables: { input: { cartEntityId, data } },
    customerAccessToken,
    fetchOptions: { cache: 'no-store' },
  });

  return response.data.cart.addCartLineItems?.cart;
};
