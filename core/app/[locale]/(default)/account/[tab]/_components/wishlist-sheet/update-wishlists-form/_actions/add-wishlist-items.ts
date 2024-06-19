'use server';

import {
  AddWishlistItems,
  addWishlistItems as addWishlistItemsMutation,
} from '~/client/mutations/add-wishlist-items';

export const addWishlistItems = async ({ input }: AddWishlistItems) => {
  try {
    const wishlist = await addWishlistItemsMutation({ input });

    if (wishlist) {
      return {
        status: 'success' as const,
        data: wishlist,
      };
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return {
        status: 'error' as const,
        message: error.message,
      };
    }
  }

  return { status: 'error' as const, message: 'Unknown error.' };
};
