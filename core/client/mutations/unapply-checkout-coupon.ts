import { getSessionCustomerAccessToken } from '~/auth';

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
  const customerAccessToken = await getSessionCustomerAccessToken();

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
    customerAccessToken,
    fetchOptions: { cache: 'no-store' },
  });

  return response.data.checkout.unapplyCheckoutCoupon?.checkout;
};
