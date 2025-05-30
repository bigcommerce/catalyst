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
import { renameWishlistSchema } from './schema';

interface State {
  lastResult: SubmissionResult | null;
  successMessage?: string;
}

export async function renameWishlist(
  prevState: Awaited<State>,
  formData: FormData,
): Promise<State> {
  const customerAccessToken = await getSessionCustomerAccessToken();
  const t = await getTranslations('Wishlist');
  const schema = renameWishlistSchema({ required_error: t('Errors.nameRequired') });
  const submission = parseWithZod(formData, { schema });

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
    const { wishlistId, wishlistName } = schema.parse(submission.value);

    const response = await client.fetch({
      document: UpdateWishlistMutation,
      customerAccessToken,
      fetchOptions: { cache: 'no-store' },
      variables: { wishlistId, input: { name: wishlistName } },
    });

    const result = response.data.wishlist.updateWishlist?.result;

    if (result?.name !== wishlistName) {
      return {
        ...prevState,
        lastResult: submission.reply({ formErrors: [t('Errors.updateFailed')] }),
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
      return {
        ...prevState,
        lastResult: submission.reply({ formErrors: [t('Errors.unauthorized')] }),
      };
    }

    return {
      ...prevState,
      lastResult: submission.reply({ formErrors: [t('Errors.unexpected')] }),
    };
  }
}
