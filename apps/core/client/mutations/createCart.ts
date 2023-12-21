import { newClient } from '..';
import { graphql } from '../generated';
import { CreateCartInput } from '../generated/graphql';

export const CREATE_CART_MUTATION = /* GraphQL */ `
  mutation createCartSimple($createCartInput: CreateCartInput!) {
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

  const response = await newClient.fetch({
    document: mutation,
    variables: {
      createCartInput: {
        lineItems: cartItems,
      },
    },
    fetchOptions: { cache: 'no-store' },
  });

  return response.data.cart.createCart?.cart;
};
