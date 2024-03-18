import { getSessionCustomerId } from '~/auth';

import { client } from '..';
import { CreateCartInput } from '../generated/graphql';
import { graphql } from '../graphql';

const CREATE_CART_MUTATION = graphql(`
  mutation CreateCart($createCartInput: CreateCartInput!) {
    cart {
      createCart(input: $createCartInput) {
        cart {
          entityId
        }
      }
    }
  }
`);

export const createCart = async (cartItems: CreateCartInput['lineItems']) => {
  const customerId = await getSessionCustomerId();

  const response = await client.fetch({
    document: CREATE_CART_MUTATION,
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
