import { z } from 'zod';

const wishlistId = z.number().nonnegative().min(1);

const wishlistItemSchema = z.object({
  productEntityId: z.number().nonnegative().min(1),
  variantEntityId: z.number().nonnegative().min(1).optional(),
});

export const newWishlistSchema = ({
  required_error = 'Wish list name cannot be empty.',
}: {
  required_error?: string;
}) =>
  z.object({
    wishlistName: z.string({ required_error }).trim().nonempty(),
    wishlistIsPublic: z.enum(['true', 'false']).optional(),
    wishlistItems: z.array(wishlistItemSchema).optional(),
  });

export const renameWishlistSchema = ({
  required_error = 'Wish list name cannot be empty.',
}: {
  required_error?: string;
}) =>
  z.object({
    wishlistId,
    wishlistName: z.string({ required_error }).trim().nonempty(),
  });

export const removeWishlistItemSchema = z.object({
  wishlistId,
  wishlistItemId: z.number().nonnegative().min(1),
});

export const toggleWishlistVisibilitySchema = z.object({
  wishlistId,
  wishlistIsPublic: z.enum(['true', 'false']),
});

export const deleteWishlistSchema = z.object({
  wishlistId,
});
