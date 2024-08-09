'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { deleteWishlists as deleteWishlistsMutation } from '~/client/mutations/delete-wishlists';

const DeleteWishlistSchema = z.object({
  entityIds: z.array(z.number()),
});

export const deleteWishlists = async (formData: FormData) => {
  const parsedData = DeleteWishlistSchema.parse({
    entityIds: [Number(formData.get('id'))],
  });

  const input = {
    ...parsedData,
  };

  try {
    const result = await deleteWishlistsMutation({ input });

    revalidatePath('/account/wishlists', 'page');

    if (result === 'success') {
      return {
        status: 'success',
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
