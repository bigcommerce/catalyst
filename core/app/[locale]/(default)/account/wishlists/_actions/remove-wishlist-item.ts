'use server';

import { BigCommerceAPIError, BigCommerceGQLError } from '@bigcommerce/catalyst-client';
import { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { revalidateTag } from 'next/cache';
import { getTranslations } from 'next-intl/server';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { TAGS } from '~/client/tags';
import { serverToast } from '~/lib/server-toast';

import { DeleteWishlistItemsMutation } from './mutation';
import { removeWishlistItemSchema } from './schema';

interface State {
  lastResult: SubmissionResult | null;
  errorMessage?: string;
}

export async function removeWishlistItem(
  prevState: Awaited<State>,
  formData: FormData,
): Promise<State> {
  const customerAccessToken = await getSessionCustomerAccessToken();
  const t = await getTranslations('Wishlist');
  const submission = parseWithZod(formData, { schema: removeWishlistItemSchema });

  if (submission.status !== 'success') {
    return {
      ...prevState,
      lastResult: { status: 'error' },
      errorMessage: t('Errors.unexpected'),
    };
  }

  if (!customerAccessToken) {
    return {
      ...prevState,
      lastResult: { status: 'error' },
      errorMessage: t('Errors.unauthorized'),
    };
  }

  try {
    const { wishlistId, wishlistItemId } = removeWishlistItemSchema.parse(submission.value);

    const response = await client.fetch({
      document: DeleteWishlistItemsMutation,
      customerAccessToken,
      fetchOptions: { cache: 'no-store' },
      variables: { wishlistId, itemIds: [wishlistItemId] },
    });

    const result = response.data.wishlist.deleteWishlistItems?.result;

    if (!result) {
      return {
        ...prevState,
        lastResult: { status: 'error' },
        errorMessage: t('Errors.removeProductFailed'),
      };
    }

    revalidateTag(TAGS.customer);

    // Server toast has to be used here since the item is being deleted. When revalidateTag is called,
    // the wishlist items will update, and the element node containing the useEffect will be removed.
    await serverToast.success(t('Result.removeItemSuccess'));

    return {
      lastResult: submission.reply(),
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    if (error instanceof BigCommerceGQLError) {
      return {
        ...prevState,
        lastResult: { status: 'error' },
        errorMessage: error.message.includes('Please sign in')
          ? t('Errors.unauthorized')
          : t('Errors.unexpected'),
      };
    }

    if (error instanceof BigCommerceAPIError) {
      return {
        ...prevState,
        lastResult: { status: 'error' },
        errorMessage: t('Errors.unexpected'),
      };
    }

    return {
      ...prevState,
      lastResult: { status: 'error' },
      errorMessage: t('Errors.unexpected'),
    };
  }
}
