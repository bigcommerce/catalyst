'use server';

import { revalidateTag } from 'next/cache';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql, VariablesOf } from '~/client/graphql';
import { doNotCachePolicy, TAGS } from "~/client/cache-policy";

const UnapplyCheckoutCouponMutation = graphql(`
  mutation UnapplyCheckoutCouponMutation($unapplyCheckoutCouponInput: UnapplyCheckoutCouponInput!) {
    checkout {
      unapplyCheckoutCoupon(input: $unapplyCheckoutCouponInput) {
        checkout {
          entityId
        }
      }
    }
  }
`);

type Variables = VariablesOf<typeof UnapplyCheckoutCouponMutation>;

interface Props {
  checkoutEntityId: Variables['unapplyCheckoutCouponInput']['checkoutEntityId'];
  couponCode: Variables['unapplyCheckoutCouponInput']['data']['couponCode'];
}

export const removeCouponCode = async ({ checkoutEntityId, couponCode }: Props) => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const response = await client.fetch({
    document: UnapplyCheckoutCouponMutation,
    variables: {
      unapplyCheckoutCouponInput: {
        checkoutEntityId,
        data: {
          couponCode,
        },
      },
    },
    customerAccessToken,
    fetchOptions: doNotCachePolicy(),
  });

  const checkout = response.data.checkout.unapplyCheckoutCoupon?.checkout;

  revalidateTag(TAGS.cart);

  return checkout;
};
