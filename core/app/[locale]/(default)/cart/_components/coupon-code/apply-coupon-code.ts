'use server';

import { expireTag } from 'next/cache';
import { z } from 'zod';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { TAGS } from '~/client/tags';

const ApplyCouponCodeSchema = z.object({
  checkoutEntityId: z.string(),
  couponCode: z.string(),
});

const ApplyCheckoutCouponMutation = graphql(`
  mutation ApplyCheckoutCouponMutation($applyCheckoutCouponInput: ApplyCheckoutCouponInput!) {
    checkout {
      applyCheckoutCoupon(input: $applyCheckoutCouponInput) {
        checkout {
          entityId
        }
      }
    }
  }
`);

export const applyCouponCode = async (formData: FormData) => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  try {
    const parsedData = ApplyCouponCodeSchema.parse({
      checkoutEntityId: formData.get('checkoutEntityId'),
      couponCode: formData.get('couponCode'),
    });

    const response = await client.fetch({
      document: ApplyCheckoutCouponMutation,
      variables: {
        applyCheckoutCouponInput: {
          checkoutEntityId: parsedData.checkoutEntityId,
          data: {
            couponCode: parsedData.couponCode,
          },
        },
      },
      customerAccessToken,
      fetchOptions: { cache: 'no-store' },
    });

    const checkout = response.data.checkout.applyCheckoutCoupon?.checkout;

    if (!checkout?.entityId) {
      return { status: 'error', error: 'Coupon code is invalid.' };
    }

    expireTag(TAGS.checkout);

    return { status: 'success', data: checkout };
  } catch (error: unknown) {
    if (error instanceof Error || error instanceof z.ZodError) {
      return { status: 'error', error: error.message };
    }

    return { status: 'error' };
  }
};
