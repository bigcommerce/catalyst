'use server';
import { getCart } from '~/client/queries/get-cart';
import { cookies } from 'next/headers';

export const getCartData = async (id: string | undefined) => {
  const cookieStore = await cookies();
  const cartId = (id) ? id : cookieStore.get('cartId')?.value;
  let cart: any;
  try {
    cart = await getCart(cartId);
    if (cart) {
      return { status: 'success', data: cart}
    }
    if (!cart?.entityId) {
      return { status: 'error', error: 'Failed to add product to cart.' };
    }

  } catch (error: unknown) {
    if (error instanceof Error) {
      return { status: 'error', error: error.message };
    }

    return { status: 'error', error: 'Something went wrong. Please try again.' };
  }
};