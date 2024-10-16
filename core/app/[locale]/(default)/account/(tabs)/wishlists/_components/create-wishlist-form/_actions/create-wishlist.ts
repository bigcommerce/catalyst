'use server';

import { z } from 'zod';

import { createWishlist as createWishlistMutation } from '~/client/mutations/create-wishlist';

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
    const newWishlist = await createWishlistMutation({ input });

    if (newWishlist) {
      return {
        status: 'success' as const,
        data: newWishlist,
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
