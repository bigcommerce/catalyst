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
export type AddCartLineItemsInput = Variables['input'];

export const addCartLineItem = async (
  cartEntityId: AddCartLineItemsInput['cartEntityId'],
  data: AddCartLineItemsInput['data'],
) => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  return await client.fetch({
    document: AddCartLineItemMutation,
    variables: { input: { cartEntityId, data } },
    customerAccessToken,
    fetchOptions: { cache: 'no-store' },
  });
};

export function assertAddCartLineItemErrors(
  response: Awaited<ReturnType<typeof addCartLineItem>>,
): asserts response is Awaited<ReturnType<typeof addCartLineItem>> {
  if (typeof response === 'object' && 'errors' in response && Array.isArray(response.errors)) {
    response.errors.forEach((error) => {
      if (error.message.includes('Not enough stock:')) {
        // This removes the item id from the message. It's very brittle, but it's the only
        // solution to do it until our API returns a better error message.
        throw new Error(
          error.message.replace('Not enough stock: ', '').replace(/\(\w.+\)\s{1}/, ''),
        );
      }

      throw new Error(error.message);
    });
  }
}
