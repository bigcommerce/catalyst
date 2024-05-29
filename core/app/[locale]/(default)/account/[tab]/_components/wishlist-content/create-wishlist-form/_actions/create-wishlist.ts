'use server';

import { z } from 'zod';

import { createWishlist as createWishlistClient } from '~/client/mutations/create-wishlist';

const CreateWishlistSchema = z.object({
  name: z.string(),
});

export const createWishlist = async (formData: FormData) => {
  const parsedData = CreateWishlistSchema.parse({
    name: formData.get('name'),
  });

  const input = {
    ...parsedData,
    isPublic: true,
  };

  const newWishlist = await createWishlistClient(input);

  if (newWishlist) {
    return {
      status: 'success',
      data: newWishlist,
    };
  }

  return {
    status: 'error',
    message: 'Wish list was not created. Please try again',
  };
};
