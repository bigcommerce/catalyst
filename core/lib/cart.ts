'use server';

import { cookies } from 'next/headers';

export async function getCartId(): Promise<string | undefined> {
  const cookieStore = await cookies();
  const cartId = cookieStore.get('cartId')?.value;

  return cartId;
}

export async function setCartId(cartId: string): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set('cartId', cartId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

export async function clearCartId(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.delete('cartId');
}
