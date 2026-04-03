'use server';

import { BigCommerceGQLError } from '@bigcommerce/catalyst-client';
import { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { getTranslations } from 'next-intl/server';

import { giftCertificateCodeActionFormDataSchema } from '@/vibes/soul/sections/cart/schema';
import { getCartId } from '~/lib/cart';

import { getCart } from '../page-data';

import { applyGiftCertificate } from './apply-gift-certificate';
import { removeGiftCertificate } from './remove-gift-certificate';

export const updateGiftCertificate = async (
  prevState: Awaited<{
    giftCertificateCodes: string[];
    lastResult: SubmissionResult | null;
  }>,
  formData: FormData,
): Promise<{
  giftCertificateCodes: string[];
  lastResult: SubmissionResult | null;
}> => {
  const t = await getTranslations('Cart.GiftCertificate');
  const submission = parseWithZod(formData, {
    schema: giftCertificateCodeActionFormDataSchema({
      required_error: t('invalidGiftCertificate'),
    }),
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
        await applyGiftCertificate({
          checkoutEntityId,
          giftCertificateCode: submission.value.giftCertificateCode,
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
                  return t('invalidGiftCertificate');
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

      const giftCertificateCode = submission.value.giftCertificateCode;

      return {
        giftCertificateCodes: [...prevState.giftCertificateCodes, giftCertificateCode],
        lastResult: submission.reply({ resetForm: true }),
      };
    }

    case 'delete': {
      try {
        await removeGiftCertificate({
          checkoutEntityId,
          giftCertificateCode: submission.value.giftCertificateCode,
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

      const giftCertificateCode = submission.value.giftCertificateCode;

      return {
        giftCertificateCodes: prevState.giftCertificateCodes.filter(
          (item) => item !== giftCertificateCode,
        ),
        lastResult: submission.reply({ resetForm: true }),
      };
    }

    default: {
      return prevState;
    }
  }
};
