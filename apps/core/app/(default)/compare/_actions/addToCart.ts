'use server';

import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';

import { addCartLineItem } from '~/client/mutations/addCartLineItem';
import { createCart } from '~/client/mutations/createCart';

export const addToCart = async (data: FormData) => {
  const productEntityId = Number(data.get('product_id'));

  const cartId = cookies().get('cartId')?.value;

  if (cartId) {
    await addCartLineItem(cartId, {
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

  const cart = await createCart([{ productEntityId, quantity: 1 }]);

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
