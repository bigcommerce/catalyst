'use server';

import { revalidateTag } from 'next/cache';
import { z } from 'zod';

import { unapplyCheckoutCoupon } from '~/client/mutations/unapply-checkout-coupon';

const RemoveCouponCodeSchema = z.object({
  checkoutEntityId: z.string(),
  couponCode: z.string(),
});

export async function removeCouponCode(formData: FormData) {
  try {
    const parsedData = RemoveCouponCodeSchema.parse({
      checkoutEntityId: formData.get('checkoutEntityId'),
      couponCode: formData.get('couponCode'),
    });

    const checkout = await unapplyCheckoutCoupon(
      parsedData.checkoutEntityId,
      parsedData.couponCode,
    );

    if (!checkout?.entityId) {
      return { status: 'error', error: 'Error ocurred removing coupon.' };
    }

    revalidateTag('checkout');

    return { status: 'success', data: checkout };
  } catch (error: unknown) {
    if (error instanceof Error || error instanceof z.ZodError) {
      return { status: 'error', error: error.message };
    }

    return { status: 'error' };
  }
}
