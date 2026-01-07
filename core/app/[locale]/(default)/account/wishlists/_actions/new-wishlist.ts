'use server';

import { BigCommerceAuthError } from '@bigcommerce/catalyst-client';
import { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { revalidateTag } from 'next/cache';
import { unstable_rethrow } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { TAGS } from '~/client/tags';

import { CreateWishlistMutation } from './mutation';
import { newWishlistSchema } from './schema';

interface State {
  lastResult: SubmissionResult | null;
  successMessage?: string;
}

export async function newWishlist(prevState: Awaited<State>, formData: FormData): Promise<State> {
  const customerAccessToken = await getSessionCustomerAccessToken();
  const t = await getTranslations('Wishlist');
  const schema = newWishlistSchema({ required_error: t('Errors.nameRequired') });
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
    const { wishlistName, wishlistIsPublic, wishlistItems } = schema.parse(submission.value);
    const isPublic = wishlistIsPublic === 'true';

    const response = await client.fetch({
      document: CreateWishlistMutation,
      customerAccessToken,
      fetchOptions: { cache: 'no-store' },
      variables: { input: { name: wishlistName, isPublic, items: wishlistItems } },
    });

    const result = response.data.wishlist.createWishlist?.result;

    if (result?.name !== wishlistName) {
      return {
        ...prevState,
        lastResult: submission.reply({ formErrors: [t('Errors.updateFailed')] }),
      };
    }

    revalidateTag(TAGS.customer);

    return {
      lastResult: submission.reply(),
      successMessage: t('Result.createSuccess'),
    };
  } catch (error) {
    unstable_rethrow(error);

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
