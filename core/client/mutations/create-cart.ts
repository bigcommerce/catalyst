import { getSessionCustomerAccessToken } from '~/auth';

import { client } from '..';
import { graphql, VariablesOf } from '../graphql';

const CreateCartMutation = graphql(`
  mutation CreateCartMutation($createCartInput: CreateCartInput!) {
    cart {
      createCart(input: $createCartInput) {
        cart {
          entityId
        }
      }
    }
  }
`);

type Variables = VariablesOf<typeof CreateCartMutation>;
type CreateCartInput = Variables['createCartInput'];
type LineItems = CreateCartInput['lineItems'];

export const createCart = async (cartItems: LineItems) => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  return await client.fetch({
    document: CreateCartMutation,
    variables: {
      createCartInput: {
        lineItems: cartItems,
      },
    },
    customerAccessToken,
    fetchOptions: { cache: 'no-store' },
  });
};

export function assertCreateCartErrors(
  response: Awaited<ReturnType<typeof createCart>>,
): asserts response is Awaited<ReturnType<typeof createCart>> {
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
