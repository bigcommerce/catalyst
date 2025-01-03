'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { z } from 'zod';
import { createWishlist as createWishlistMutation } from '~/client/mutations/create-wishlist';
import { addWishlistItems } from '~/client/mutations/add-wishlist-items';

// Schema for creating wishlist
const CreateWishlistSchema = z.object({
  name: z.string(),
});

// Types for add to wishlist functionality
interface WishlistApiResponse {
  entityId: number;
  items: Array<{
    entityId: number;
    product: {
      entityId: number;
      name: string;
    };
  }>;
}

type WishlistResult =
  | {
      status: 'success';
      data: WishlistApiResponse;
      message?: string;
    }
  | {
      status: 'error';
      message: string;
      data?: undefined;
    };

// Create wishlist function
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

    revalidatePath('/account/wishlists', 'page');

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

// Add to wishlist function
export const addToWishlist = async (
  wishlistId: number,
  productId: number,
  variantId?: number,
): Promise<WishlistResult> => {
  try {
    const input = {
      entityId: wishlistId,
      items: [
        {
          productEntityId: productId,
          variantEntityId: variantId || null,
        },
      ],
    };

    const result = await addWishlistItems({
      input,
      hideOutOfStock: false,
    });

    if (result) {
      revalidateTag('wishlists');
      revalidatePath('/account/wishlists', 'page');
      return {
        status: 'success' as const,
        data: result,
      };
    }

    return {
      status: 'error' as const,
      message: 'Failed to add items to wishlist',
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return {
        status: 'error' as const,
        message: error.message,
      };
    }

    return {
      status: 'error' as const,
      message: 'An unknown error occurred',
    };
  }
};
