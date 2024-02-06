import { getSessionCustomerId } from '~/auth';

import { client } from '..';
import { graphql } from '../generated';
import { CreateCartInput } from '../generated/graphql';

export const CREATE_CART_MUTATION = /* GraphQL */ `
  mutation CreateCart($createCartInput: CreateCartInput!) {
    cart {
      createCart(input: $createCartInput) {
        cart {
          entityId
        }
      }
    }
  }
`;

export const createCart = async (cartItems: CreateCartInput['lineItems']) => {
  const mutation = graphql(CREATE_CART_MUTATION);
  const customerId = await getSessionCustomerId();

  const response = await client.fetch({
    document: mutation,
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
