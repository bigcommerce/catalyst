'use server';

import { BigCommerceAuthError } from '@bigcommerce/catalyst-client';
import { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { revalidateTag } from 'next/cache';
import { getTranslations } from 'next-intl/server';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { TAGS } from '~/client/tags';

import { UpdateWishlistMutation } from './mutation';
import { toggleWishlistVisibilitySchema } from './schema';

interface State {
  lastResult: SubmissionResult | null;
  successMessage?: string;
  errorMessage?: string;
}

export async function toggleWishlistVisibility(
  prevState: Awaited<State>,
  formData: FormData,
): Promise<State> {
  const customerAccessToken = await getSessionCustomerAccessToken();
  const t = await getTranslations('Wishlist');
  const submission = parseWithZod(formData, { schema: toggleWishlistVisibilitySchema });

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
      errorMessage: t('Errors.unauthorized'),
    };
  }

  try {
    const { wishlistId, wishlistIsPublic } = toggleWishlistVisibilitySchema.parse(submission.value);
    const isPublic = wishlistIsPublic === 'true';

    const response = await client.fetch({
      document: UpdateWishlistMutation,
      customerAccessToken,
      fetchOptions: { cache: 'no-store' },
      variables: { wishlistId, input: { isPublic } },
    });

    const result = response.data.wishlist.updateWishlist?.result;

    if (result?.isPublic !== isPublic) {
      return {
        ...prevState,
        lastResult: submission.reply({ formErrors: [t('Errors.updateFailed')] }),
        errorMessage: t('Errors.updateFailed'),
      };
    }

    revalidateTag(TAGS.customer);

    return {
      lastResult: submission.reply(),
      successMessage: t('Result.updateSuccess'),
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    if (error instanceof BigCommerceAuthError) {
      const authErrorMessage = t('Errors.unauthorized');

      return {
        ...prevState,
        lastResult: submission.reply({ formErrors: [authErrorMessage] }),
        errorMessage: authErrorMessage,
      };
    }

    const errorMessage = t('Errors.unexpected');

    return {
      ...prevState,
      lastResult: submission.reply({ formErrors: [errorMessage] }),
      errorMessage,
    };
  }
}
