import { client } from '../client';

export const deleteCartLineItem = async (cartEntityId: string, lineItemEntityId: string) => {
  const response = await client.mutation({
    cart: {
      deleteCartLineItem: {
        __args: {
          input: {
            cartEntityId,
            lineItemEntityId,
          },
        },
        cart: {
          entityId: true,
        },
      },
    },
  });

  return response.cart.deleteCartLineItem?.cart;
};
