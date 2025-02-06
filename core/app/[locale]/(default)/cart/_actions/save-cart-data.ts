'use server';

import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';

import { getSessionCustomerAccessToken } from '~/auth';
import { createWishlist as createWishlistMutation } from '~/client/mutations/create-wishlist';

export async function saveCartData(cartItemsData: any) {
  const customerAccessToken = await getSessionCustomerAccessToken();
  const dateTime = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hourCycle: 'h23',
  }).format(new Date());
  const input = {
    name: 'Saved Cart',
    items: cartItemsData,
    isPublic: true,
  };
  try {
    const cookieStore = await cookies();
    const cartId = cookieStore.get('cartId')?.value;

    if (!cartId) {
      return { status: 'error', error: 'No cartId cookie found' };
    }

    if (!customerAccessToken) {
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
