'use server';

import { getCart } from '~/client/queries/get-cart';

export async function getCartData(cartId: string) {
  try {
    const cart = await getCart(cartId);

    if (cart) {
      if (!cart.entityId) {
        return { error: 'Failed to get cart data.' };
      }

      return cart;
    }
  } catch (e) {
    return { error: 'Something went wrong. Please try again.' };
  }
}
