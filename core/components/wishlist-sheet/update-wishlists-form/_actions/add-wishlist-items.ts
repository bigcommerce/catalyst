'use server';

import {
  AddWishlistItems,
  addWishlistItems as addWishlistItemsMutation,
} from '~/client/mutations/add-wishlist-items';

export const addWishlistItems = async ({ input }: AddWishlistItems) => {
  try {
    const response = await addWishlistItemsMutation({ input });

    if (response) {
      return {
        status: 'success',
        data: response,
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
