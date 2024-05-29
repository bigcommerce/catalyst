'use server';

import {
  deleteWishlists as deleteWishlistsClient,
  Input,
} from '~/client/mutations/delete-wishlists';

export const deleteWishlists = async (wishlists: Input) => {
  const result = await deleteWishlistsClient(wishlists);

  return result;
};
