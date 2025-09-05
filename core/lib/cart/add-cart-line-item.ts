import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql, VariablesOf } from '~/client/graphql';

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
