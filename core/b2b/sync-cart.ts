'use server';

import { setCartId } from '~/lib/cart';

export const syncCart = async (cartId: string) => {
  try {
    await setCartId(cartId);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
  }
};
