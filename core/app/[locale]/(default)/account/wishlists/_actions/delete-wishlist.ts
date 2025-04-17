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

import { DeleteWishlistMutation } from './mutation';
import { deleteWishlistSchema } from './schema';

interface State {
  lastResult: SubmissionResult | null;
  successMessage?: string;
}

export async function deleteWishlist(
  prevState: Awaited<State>,
  formData: FormData,
): Promise<State> {
  const customerAccessToken = await getSessionCustomerAccessToken();
  const t = await getTranslations('Account.Wishlists');
  const submission = parseWithZod(formData, { schema: deleteWishlistSchema });

  if (submission.status !== 'success') {
    return {
      ...prevState,
      lastResult: submission.reply(),
    };
  }

  if (!customerAccessToken) {
    return {
      ...prevState,
      lastResult: submission.reply({ formErrors: [t('Errors.unauthorized')] }),
    };
  }

  try {
    const { wishlistId } = deleteWishlistSchema.parse(submission.value);

    const response = await client.fetch({
      document: DeleteWishlistMutation,
      customerAccessToken,
      fetchOptions: { cache: 'no-store' },
      variables: { wishlistId },
    });

    const result = response.data.wishlist.deleteWishlists?.result;

    if (result !== 'success') {
      return {
        ...prevState,
        lastResult: submission.reply({ formErrors: [t('Errors.deleteFailed')] }),
      };
    }

    revalidateTag(TAGS.customer);

    // Server toast has to be used here since the item is being deleted. When revalidateTag is called,
    // the wishlist items will update, and the element node containing the useEffect will be removed.
    await serverToast.success(t('Result.deleteSuccess'));

    return {
      lastResult: submission.reply(),
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    if (error instanceof BigCommerceGQLError) {
      return {
        ...prevState,
        lastResult: submission.reply({ formErrors: [t('Errors.unexpected')] }),
      };
    }

    if (error instanceof BigCommerceAPIError) {
      return {
        ...prevState,
        lastResult: submission.reply({ formErrors: [t('Errors.unexpected')] }),
      };
    }

    return {
      ...prevState,
      lastResult: submission.reply({ formErrors: [t('Errors.unexpected')] }),
    };
  }
}
