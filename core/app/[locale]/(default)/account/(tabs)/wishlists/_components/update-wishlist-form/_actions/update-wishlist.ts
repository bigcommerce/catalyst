'use server';

import { z } from 'zod';

import { updateWishlist as updateWishlistMutation } from '~/client/mutations/update-wishlist';

const UpdateWishlistSchema = z.object({
  entityId: z.string(),
  name: z.string(),
});

export const updateWishlist = async (formData: FormData) => {
  const { entityId, name } = UpdateWishlistSchema.parse({
    entityId: formData.get('entityId'),
    name: formData.get('name'),
  });

  try {
    const updatedWishlist = await updateWishlistMutation({
      input: {
        data: {
          name,
        },
        entityId: +entityId,
      },
    });

    if (updatedWishlist) {
      return {
        status: 'success' as const,
        data: updatedWishlist,
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
