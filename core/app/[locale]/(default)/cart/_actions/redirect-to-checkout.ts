'use server';

import { BigCommerceGQLError } from '@bigcommerce/catalyst-client';
import { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { getLocale, getTranslations } from 'next-intl/server';
import { z } from 'zod';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { doNotCachePolicy } from '~/client/cache-policy';
import { graphql } from '~/client/graphql';
import { redirect } from '~/i18n/routing';
import { getCartId } from '~/lib/cart';

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

  const customerAccessToken = await getSessionCustomerAccessToken();

  const submission = parseWithZod(formData, { schema: z.object({}) });

  const cartId = await getCartId();

  if (!cartId) {
    return submission.reply({ formErrors: [t('cartNotFound')] });
  }

  let url;

  try {
    const { data } = await client.fetch({
      document: CheckoutRedirectMutation,
      variables: { cartId },
      fetchOptions: doNotCachePolicy(),
      customerAccessToken,
    });

    url = data.cart.createCartRedirectUrls.redirectUrls?.redirectedCheckoutUrl;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

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
