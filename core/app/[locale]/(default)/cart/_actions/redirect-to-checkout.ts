'use server';

import { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { cookies } from 'next/headers';
import { getLocale, getTranslations } from 'next-intl/server';
import { z } from 'zod';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { redirect } from '~/i18n/routing';

const CheckoutRedirectMutation = graphql(`
  mutation CheckoutRedirectMutation($cartId: String!) {
    cart {
      createCartRedirectUrls(input: { cartEntityId: $cartId }) {
        redirectUrls {
          redirectedCheckoutUrl
        }
      }
    }
  }
`);

export const redirectToCheckout = async (
  _lastResult: SubmissionResult | null,
  formData: FormData,
): Promise<SubmissionResult | null> => {
  const locale = await getLocale();
  const t = await getTranslations('Cart.Errors');
  const cookieStore = await cookies();

  const customerAccessToken = await getSessionCustomerAccessToken();

  const submission = parseWithZod(formData, { schema: z.object({}) });

  const cartId = cookieStore.get('cartId')?.value;

  if (!cartId) {
    return submission.reply({ formErrors: [t('cartNotFound')] });
  }

  let url;

  try {
    const { data } = await client.fetch({
      document: CheckoutRedirectMutation,
      variables: { cartId },
      fetchOptions: { cache: 'no-store' },
      customerAccessToken,
    });

    url = data.cart.createCartRedirectUrls.redirectUrls?.redirectedCheckoutUrl;
  } catch (error) {
    if (error instanceof Error) {
      return submission.reply({ formErrors: [error.message] });
    }

    return submission.reply({ formErrors: [String(error)] });
  }

  if (!url) {
    return submission.reply({ formErrors: [t('failedToRedirectToCheckout')] });
  }

  return redirect({ href: url, locale });
};
