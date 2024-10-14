'use server';

import { getTranslations } from 'next-intl/server';
import { z } from 'zod';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';

const UpdateWishlistMutation = graphql(`
  mutation UpdateWishlist($input: UpdateWishlistInput!) {
    wishlist {
      updateWishlist(input: $input) {
        result {
          entityId
          name
        }
      }
    }
  }
`);

const UpdateWishlistSchema = z.object({
  entityId: z.string(),
  name: z.string(),
});

export const updateWishlist = async (formData: FormData) => {
  const t = await getTranslations('Account.Wishlist');
  const customerAccessToken = await getSessionCustomerAccessToken();

  try {
    const { entityId, name } = UpdateWishlistSchema.parse({
      entityId: formData.get('entityId'),
      name: formData.get('name'),
    });

    const response = await client.fetch({
      document: UpdateWishlistMutation,
      variables: {
        input: {
          data: {
            name,
          },
          entityId: +entityId,
        },
      },
      customerAccessToken,
      fetchOptions: { cache: 'no-store' },
    });

    const { updateWishlist: updatedWishlist } = response.data.wishlist;

    if (updatedWishlist) {
      return {
        status: 'success' as const,
        data: updatedWishlist.result,
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
