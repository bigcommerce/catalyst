import { getSessionCustomerId } from '~/auth';

import { client } from '..';
import { graphql } from '../graphql';

const APPLY_CHECKOUT_COUPON = graphql(`
  mutation ApplyCheckoutCoupon($applyCheckoutCouponInput: ApplyCheckoutCouponInput!) {
    checkout {
      applyCheckoutCoupon(input: $applyCheckoutCouponInput) {
        checkout {
          entityId
        }
      }
    }
  }
`);

export const applyCheckoutCoupon = async (checkoutEntityId: string, couponCode: string) => {
  const customerId = await getSessionCustomerId();

  const response = await client.fetch({
    document: APPLY_CHECKOUT_COUPON,
    variables: {
      applyCheckoutCouponInput: {
        checkoutEntityId,
        data: {
          couponCode,
        },
      },
    },
    customerId: Number(customerId),
    fetchOptions: { cache: 'no-store' },
  });

  return response.data.checkout.applyCheckoutCoupon?.checkout;
};
