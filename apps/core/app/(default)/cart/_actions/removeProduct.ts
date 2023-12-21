'use server';

import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';

import { deleteCartLineItem } from '~/client/mutations/deleteCartLineItem';

export async function removeProduct(formData: FormData) {
  const cartId = cookies().get('cartId')?.value;

  if (!cartId) {
    throw new Error('No cartId cookie found');
  }

  const lineItemEntityId = formData.get('lineItemEntityId');

  if (!lineItemEntityId) {
    throw new Error('No lineItemEntityId found');
  }

  const updatedCart = await deleteCartLineItem(cartId, lineItemEntityId.toString());

  // If we remove the last item in a cart the cart is deleted
  // so we need to remove the cartId cookie
  if (!updatedCart) {
    cookies().delete('cartId');
    revalidateTag('cart');
  }

  revalidateTag('cart');
}
