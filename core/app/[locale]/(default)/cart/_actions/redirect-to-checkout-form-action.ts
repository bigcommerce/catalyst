'use server';

import { BigCommerceGQLError } from '@bigcommerce/catalyst-client';
import { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { getLocale, getTranslations } from 'next-intl/server';
import { z } from 'zod';

import { redirect } from '~/i18n/routing';
import { getCartId } from '~/lib/cart';

import { redirectToCheckout } from './redirect-to-checkout';

export const redirectToCheckoutFormAction = async (
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

  let url;

  try {
    const { data } = await redirectToCheckout(cartId);

    url = data.cart.createCartRedirectUrls.redirectUrls?.redirectedCheckoutUrl;
  } catch (error) {
    if (error instanceof BigCommerceGQLError) {
      return submission.reply({
        formErrors: error.errors.map(({ message }) => message),
      });
    }

    if (error instanceof Error) {
      return submission.reply({ formErrors: [error.message] });
    }

    return submission.reply({ formErrors: [t('failedToRedirectToCheckout')] });
  }

  if (!url) {
    return submission.reply({ formErrors: [t('failedToRedirectToCheckout')] });
  }

  return redirect({ href: url, locale });
};
