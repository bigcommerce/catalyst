'use server';

import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';

import { addCartLineItem } from '~/clients/new/mutations/addCartLineItem';
import { createCart } from '~/clients/new/mutations/createCart';
import { getCart } from '~/clients/new/queries/getCart';

export const addToCart = async (data: FormData) => {
  const productEntityId = Number(data.get('product_id'));

  const cartId = cookies().get('cartId')?.value;
  const cart = await getCart(cartId);

  if (cart) {
    await addCartLineItem(cart.entityId, {
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

  const newCart = await createCart([{ productEntityId, quantity: 1 }]);

  if (newCart) {
    cookies().set({
      name: 'cartId',
      value: newCart.entityId,
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
    });
  }

  revalidateTag('cart');
};
