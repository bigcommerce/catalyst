import { client } from '../client';
import { UpdateCartLineItemDataInput } from '../generated';

export const updateCartLineItem = async (
  cartEntityId: string,
  lineItemEntityId: string,
  data: UpdateCartLineItemDataInput,
) => {
  const response = await client.mutation({
    cart: {
      updateCartLineItem: {
        __args: {
          input: {
            cartEntityId,
            lineItemEntityId,
            data,
          },
        },
        cart: {
          entityId: true,
        },
      },
    },
  });

  return response.cart.updateCartLineItem?.cart;
};
