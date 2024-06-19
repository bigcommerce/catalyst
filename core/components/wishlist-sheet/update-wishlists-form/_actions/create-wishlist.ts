'use server';

import {
  CreateWishlist,
  createWishlist as createWishlistMutation,
} from '~/client/mutations/create-wishlist';

export const createWishlist = async ({ input }: CreateWishlist) => {
  try {
    const newWishlist = await createWishlistMutation({ input });

    return {
      status: 'success',
      data: newWishlist,
    };
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
