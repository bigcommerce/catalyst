'use server';

import { revalidatePath } from 'next/cache';

import {
  DeleteWishlistItems,
  deleteWishlistItems as deleteWishlistItemsMutation,
} from '~/client/mutations/delete-wishlist-items';

export const deleteWishlistItem = async ({ input }: DeleteWishlistItems) => {
  try {
    const wishlist = await deleteWishlistItemsMutation({ input });

    revalidatePath('/account/wishlists', 'page');

    if (wishlist) {
      return {
        status: 'success',
        data: wishlist,
      };
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  return { status: 'error', message: 'Unknown error.' };
};
