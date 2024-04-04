import { getSessionCustomerId } from '~/auth';

import { client } from '..';
import { graphql } from '../graphql';

const UNAPPLY_CHECKOUT_COUPON = graphql(`
  mutation UnapplyCheckoutCoupon($unapplyCheckoutCouponInput: UnapplyCheckoutCouponInput!) {
    checkout {
      unapplyCheckoutCoupon(input: $unapplyCheckoutCouponInput) {
        checkout {
          entityId
        }
      }
    }
  }
`);

export const unapplyCheckoutCoupon = async (checkoutEntityId: string, couponCode: string) => {
  const customerId = await getSessionCustomerId();

  const response = await client.fetch({
    document: UNAPPLY_CHECKOUT_COUPON,
    variables: {
      unapplyCheckoutCouponInput: {
        checkoutEntityId,
        data: {
          couponCode,
        },
      },
    },
    customerId: Number(customerId),
    fetchOptions: { cache: 'no-store' },
  });

  return response.data.checkout.unapplyCheckoutCoupon?.checkout;
};
