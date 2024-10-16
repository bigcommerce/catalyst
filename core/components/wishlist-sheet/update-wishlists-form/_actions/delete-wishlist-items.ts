'use server';

import {
  DeleteWishlistItems,
  deleteWishlistItems as deleteWishlistItemsMutation,
} from '~/client/mutations/delete-wishlist-items';

export const deleteWishlistItems = async ({ input }: DeleteWishlistItems) => {
  try {
    const wishlist = await deleteWishlistItemsMutation({ input });

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
