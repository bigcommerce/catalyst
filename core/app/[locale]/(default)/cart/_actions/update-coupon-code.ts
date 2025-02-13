'use server';

import { BigCommerceGQLError } from '@bigcommerce/catalyst-client';
import { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { getTranslations } from 'next-intl/server';

import { couponCodeActionFormDataSchema } from '@/vibes/soul/sections/cart/schema';
import { getCartId } from '~/lib/cart';

import { getCart } from '../page-data';

import { applyCouponCode } from './apply-coupon-code';
import { removeCouponCode } from './remove-coupon-code';

export const updateCouponCode = async (
  prevState: Awaited<{
    couponCodes: string[];
    lastResult: SubmissionResult | null;
  }>,
  formData: FormData,
): Promise<{
  couponCodes: string[];
  lastResult: SubmissionResult | null;
}> => {
  const t = await getTranslations('Cart.CheckoutSummary.CouponCode');
  const submission = parseWithZod(formData, {
    schema: couponCodeActionFormDataSchema({ required_error: t('invalidCouponCode') }),
  });

  const cartId = await getCartId();

  if (!cartId) {
    return { ...prevState, lastResult: submission.reply({ formErrors: [t('cartNotFound')] }) };
  }

  const cart = await getCart({ cartId });
  const checkout = cart.site.checkout;

  if (!checkout) {
    return { ...prevState, lastResult: submission.reply({ formErrors: [t('cartNotFound')] }) };
  }

  const checkoutEntityId = checkout.entityId;

  if (!checkoutEntityId) {
    return { ...prevState, lastResult: submission.reply({ formErrors: [t('cartNotFound')] }) };
  }

  if (submission.status !== 'success') {
    return {
      ...prevState,
      lastResult: submission.reply(),
    };
  }

  switch (submission.value.intent) {
    case 'apply': {
      try {
        await applyCouponCode({
          checkoutEntityId,
          couponCode: submission.value.couponCode,
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);

        if (error instanceof BigCommerceGQLError) {
          return {
            ...prevState,
            lastResult: submission.reply({
              formErrors: error.errors.map(({ message }) => {
                if (message.includes('Incorrect or mismatch:')) {
                  return t('invalidCouponCode');
                }

                return message;
              }),
            }),
          };
        }

        if (error instanceof Error) {
          return { ...prevState, lastResult: submission.reply({ formErrors: [error.message] }) };
        }

        return { ...prevState, lastResult: submission.reply({ formErrors: [String(error)] }) };
      }

      const couponCode = submission.value.couponCode;

      return {
        couponCodes: [...prevState.couponCodes, couponCode],
        lastResult: submission.reply({ resetForm: true }),
      };
    }

    case 'delete': {
      try {
        await removeCouponCode({
          checkoutEntityId,
          couponCode: submission.value.couponCode,
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);

        if (error instanceof BigCommerceGQLError) {
          return {
            ...prevState,
            lastResult: submission.reply({
              formErrors: error.errors.map(({ message }) => message),
            }),
          };
        }

        if (error instanceof Error) {
          return { ...prevState, lastResult: submission.reply({ formErrors: [error.message] }) };
        }

        return { ...prevState, lastResult: submission.reply({ formErrors: [String(error)] }) };
      }

      const couponCode = submission.value.couponCode;

      return {
        couponCodes: prevState.couponCodes.filter((item) => item !== couponCode),
        lastResult: submission.reply({ resetForm: true }),
      };
    }

    default: {
      return prevState;
    }
  }
};
