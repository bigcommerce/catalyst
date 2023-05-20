import { client } from '../client';
import { CartLineItemInput } from '../generated';

export const createCart = async (lineItems: CartLineItemInput[]) => {
  const response = await client.mutation({
    cart: {
      createCart: {
        __args: {
          input: {
            lineItems,
          },
        },
        cart: {
          __scalar: true,
        },
      },
    },
  });

  return response.cart.createCart?.cart;
};
