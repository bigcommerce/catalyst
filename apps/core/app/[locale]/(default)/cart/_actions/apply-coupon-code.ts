'use server';

import { revalidateTag } from 'next/cache';
import { z } from 'zod';

import { applyCheckoutCoupon } from '~/client/mutations/apply-checkout-coupon';

const ApplyCouponCodeSchema = z.object({
  checkoutEntityId: z.string(),
  couponCode: z.string(),
});

export async function applyCouponCode(formData: FormData) {
  try {
    const parsedData = ApplyCouponCodeSchema.parse({
      checkoutEntityId: formData.get('checkoutEntityId'),
      couponCode: formData.get('couponCode'),
    });

    const checkout = await applyCheckoutCoupon(parsedData.checkoutEntityId, parsedData.couponCode);

    if (!checkout?.entityId) {
      return { status: 'error', error: 'Coupon code is invalid' };
    }

    revalidateTag('checkout');

    return { status: 'success', data: checkout };
  } catch (e: unknown) {
    if (e instanceof Error || e instanceof z.ZodError) {
      return { status: 'error', error: e.message };
    }

    return { status: 'error' };
  }
}
