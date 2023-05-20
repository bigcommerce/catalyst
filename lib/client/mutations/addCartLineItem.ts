import { client } from '../client';
import { AddCartLineItemsDataInput } from '../generated';

export const addCartLineItem = async (cartEntityId: string, data: AddCartLineItemsDataInput) => {
  const response = await client.mutation({
    cart: {
      addCartLineItems: {
        __args: {
          input: {
            cartEntityId,
            data,
          },
        },
        cart: {
          entityId: true,
        },
      },
    },
  });

  return response.cart.addCartLineItems?.cart;
};
