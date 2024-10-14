'use server';

import { revalidatePath } from 'next/cache';
import { getTranslations } from 'next-intl/server';
import { z } from 'zod';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';

const DeleteWishlistsMutation = graphql(`
  mutation DeleteWishlists($input: DeleteWishlistsInput!) {
    wishlist {
      deleteWishlists(input: $input) {
        result
      }
    }
  }
`);

const DeleteWishlistSchema = z.object({
  entityIds: z.array(z.number()),
});

export const deleteWishlists = async (formData: FormData) => {
  const t = await getTranslations('Account.Wishlist');
  const customerAccessToken = await getSessionCustomerAccessToken();

  try {
    const parsedData = DeleteWishlistSchema.parse({
      entityIds: [Number(formData.get('id'))],
    });

    const response = await client.fetch({
      document: DeleteWishlistsMutation,
      variables: {
        input: {
          ...parsedData,
        },
      },
      customerAccessToken,
      fetchOptions: { cache: 'no-store' },
    });

    revalidatePath('/account/wishlists', 'page');

    const { deleteWishlists: deletedWishlists } = response.data.wishlist;

    if (deletedWishlists?.result === 'success') {
      return {
        status: 'success' as const,
      };
    }

    return {
      status: 'error' as const,
      message: t('Errors.error'),
    };
  } catch (error: unknown) {
    if (error instanceof Error || error instanceof z.ZodError) {
      return {
        status: 'error' as const,
        message: error.message,
      };
    }

    return { status: 'error' as const, message: t('error') };
  }
};
