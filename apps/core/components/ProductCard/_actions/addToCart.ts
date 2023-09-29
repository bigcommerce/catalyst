'use server';

import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';

import client from '~/client';

export const handleAddToCart = async (data: FormData) => {
  const productEntityId = Number(data.get('product_id'));

  const cartId = cookies().get('cartId')?.value;

  if (cartId) {
    await client.addCartLineItem(cartId, {
      lineItems: [
        {
          productEntityId,
          quantity: 1,
        },
      ],
    });

    revalidateTag('cart');

    return;
  }

  const cart = await client.createCart([{ productEntityId, quantity: 1 }]);

  if (cart) {
    cookies().set({
      name: 'cartId',
      value: cart.entityId,
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
    });
  }

  revalidateTag('cart');
};
