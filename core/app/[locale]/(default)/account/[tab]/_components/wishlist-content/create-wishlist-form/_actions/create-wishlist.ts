'use server';

import { revalidatePath } from 'next/cache';
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

  try {
    const newWishlist = await createWishlistClient(input);

    revalidatePath('/account/wishlists', 'page');

    if (newWishlist) {
      return {
        status: 'success',
        data: newWishlist,
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
