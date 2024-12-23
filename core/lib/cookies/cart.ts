'use server';

import { cookies } from 'next/headers';

const CART_ID_COOKIE = 'cartId';

export const getCartId = async () => {
  const cookieStore = await cookies();

  return cookieStore.get(CART_ID_COOKIE)?.value;
};

export const setCartId = async (cartId: string) => {
  const cookieStore = await cookies();

  cookieStore.set({
    name: CART_ID_COOKIE,
    value: cartId,
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
  });
};

export const removeCartId = async () => {
  const cookieStore = await cookies();

  cookieStore.delete(CART_ID_COOKIE);
};
