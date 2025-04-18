'use server';

import { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { getLocale, getTranslations } from 'next-intl/server';
import { z } from 'zod';

import { redirect } from '~/i18n/routing';
import { getCartId } from '~/lib/cart';

export const redirectToCheckout = async (
  _lastResult: SubmissionResult | null,
  formData: FormData,
): Promise<SubmissionResult | null> => {
  const locale = await getLocale();
  const t = await getTranslations('Cart.Errors');

  const submission = parseWithZod(formData, { schema: z.object({}) });

  const cartId = await getCartId();

  if (!cartId) {
    return submission.reply({ formErrors: [t('cartNotFound')] });
  }

  return redirect({ href: '/checkout', locale });
};
