'use server';

import { revalidateTag } from 'next/cache';
import { z } from 'zod';

import { unapplyCheckoutCoupon } from '~/client/mutations/unapply-checkout-coupon';

const RemoveCouponCodeSchema = z.object({
  couponCode: z.string(),
});

export async function removeCouponCode(formData: FormData, checkoutEntityId: string) {
  try {
    const parsedData = RemoveCouponCodeSchema.parse({
      couponCode: formData.get('couponCode'),
    });

    const checkout = await unapplyCheckoutCoupon(checkoutEntityId, parsedData.couponCode);

    if (!checkout?.entityId) {
      return { status: 'error', error: 'Error ocurred removing coupon' };
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
