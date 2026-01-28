'use server';

import { BigCommerceGQLError } from '@bigcommerce/catalyst-client';
import { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { getTranslations } from 'next-intl/server';

import { promoCodeActionFormDataSchema } from '@/vibes/soul/sections/cart/schema';
import { getCartId } from '~/lib/cart';

import { getCart } from '../page-data';

import { applyCouponCode } from './apply-coupon-code';
import { applyGiftCertificate } from './apply-gift-certificate';
import { removeCouponCode } from './remove-coupon-code';
import { removeGiftCertificate } from './remove-gift-certificate';

export interface PromoCodeFormState {
  couponCodes: string[];
  giftCertificateCodes: string[];
  lastResult: SubmissionResult | null;
}

export const updatePromoCode = async (
  prevState: Awaited<PromoCodeFormState>,
  formData: FormData,
): Promise<PromoCodeFormState> => {
  const tCoupon = await getTranslations('Cart.CheckoutSummary.CouponCode');
  const tGiftCertificate = await getTranslations('Cart.GiftCertificate');
  const tPromoCode = await getTranslations('Cart.CheckoutSummary.PromoCode');
  const submission = parseWithZod(formData, {
    schema: promoCodeActionFormDataSchema({
      required_error: tPromoCode('invalidPromoCode'),
    }),
  });

  const cartId = await getCartId();

  if (!cartId) {
    return {
      ...prevState,
      lastResult: submission.reply({ formErrors: [tCoupon('cartNotFound')] }),
    };
  }

  const cart = await getCart({ cartId });
  const checkout = cart.site.checkout;

  if (!checkout) {
    return {
      ...prevState,
      lastResult: submission.reply({ formErrors: [tCoupon('cartNotFound')] }),
    };
  }

  const checkoutEntityId = checkout.entityId;

  if (!checkoutEntityId) {
    return {
      ...prevState,
      lastResult: submission.reply({ formErrors: [tCoupon('cartNotFound')] }),
    };
  }

  if (submission.status !== 'success') {
    return {
      ...prevState,
      lastResult: submission.reply(),
    };
  }

  switch (submission.value.intent) {
    case 'apply': {
      const code = submission.value.code.trim();

      // Try to apply as coupon first
      try {
        await applyCouponCode({
          checkoutEntityId,
          couponCode: code,
        });

        return {
          couponCodes: [...prevState.couponCodes, code],
          giftCertificateCodes: prevState.giftCertificateCodes,
          lastResult: submission.reply({ resetForm: true }),
        };
      } catch (couponError) {
        // If coupon fails, try as gift certificate
        try {
          await applyGiftCertificate({
            checkoutEntityId,
            giftCertificateCode: code,
          });

          return {
            couponCodes: prevState.couponCodes,
            giftCertificateCodes: [...prevState.giftCertificateCodes, code],
            lastResult: submission.reply({ resetForm: true }),
          };
        } catch (giftCertificateError) {
          // Both failed, use the generic invalid promo code message
          let errorMessage = tPromoCode('invalidPromoCode');

          if (giftCertificateError instanceof BigCommerceGQLError) {
            const giftCertMessage = giftCertificateError.errors[0]?.message ?? '';
            if (giftCertMessage.includes('Incorrect or mismatch:')) {
              errorMessage = tPromoCode('invalidPromoCode');
            } else {
              errorMessage = giftCertMessage;
            }
          } else if (couponError instanceof BigCommerceGQLError) {
            const couponMessage = couponError.errors[0]?.message ?? '';
            if (couponMessage.includes('Incorrect or mismatch:')) {
              errorMessage = tPromoCode('invalidPromoCode');
            } else {
              errorMessage = couponMessage;
            }
          } else if (giftCertificateError instanceof Error) {
            errorMessage = giftCertificateError.message;
          } else if (couponError instanceof Error) {
            errorMessage = couponError.message;
          }

          return {
            ...prevState,
            lastResult: submission.reply({ formErrors: [errorMessage] }),
          };
        }
      }
    }

    case 'delete-coupon': {
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

      return {
        ...prevState,
        couponCodes: prevState.couponCodes.filter(
          (item) => item !== submission.value.couponCode,
        ),
        lastResult: submission.reply({ resetForm: true }),
      };
    }

    case 'delete-gift-certificate': {
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

      return {
        ...prevState,
        giftCertificateCodes: prevState.giftCertificateCodes.filter(
          (item) => item !== submission.value.giftCertificateCode,
        ),
        lastResult: submission.reply({ resetForm: true }),
      };
    }

    default: {
      return prevState;
    }
  }
};
