'use server';

import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';

import { getSessionCustomerId } from '~/auth';
import { createWishlist as createWishlistMutation } from '~/client/mutations/create-wishlist';

export async function saveCartData(cartItemsData: any) {
  const customerId = await getSessionCustomerId();
  const dateTime = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
   second: 'numeric',
    hourCycle: 'h23'
 }).format(new Date());
  const input = {
    name: "Save Cart - "+dateTime?.replace(', ', '-'),
    items: cartItemsData,
    isPublic: true,
  };
  try {
    const cartId = cookies().get('cartId')?.value;

    if (!cartId) {
      return { status: 'error', error: 'No cartId cookie found' };
    }

    if (!customerId) {
      return { status: 'error', error: 'Please login to continue' };
    }

    const newWishlist = await createWishlistMutation({ input });

    return { status: 'success', data: newWishlist };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { status: 'error', error: error.message };
    }

    return { status: 'error' };
  }
}
