import { getSessionCustomerId } from '~/auth';

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
  const customerId = await getSessionCustomerId();

  const response = await client.fetch({
    document: CreateCartMutation,
    variables: {
      createCartInput: {
        lineItems: cartItems,
      },
    },
    customerId,
    fetchOptions: { cache: 'no-store' },
  });

  return response.data.cart.createCart?.cart;
};
