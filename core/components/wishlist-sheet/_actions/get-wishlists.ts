'use server';

import { getWishlists as getWishlistsQuery } from '~/client/queries/get-wishlists';

export const getWishlists = async () => {
  try {
    const response = await getWishlistsQuery();

    return {
      status: 'success',
      data: response,
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
