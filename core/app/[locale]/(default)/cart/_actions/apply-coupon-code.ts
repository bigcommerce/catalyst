'use server';

import { revalidateTag } from 'next/cache';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql, VariablesOf } from '~/client/graphql';
import { doNotCachePolicy, TAGS } from "~/client/cache-policy";

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

type Variables = VariablesOf<typeof ApplyCheckoutCouponMutation>;

interface Props {
  checkoutEntityId: Variables['applyCheckoutCouponInput']['checkoutEntityId'];
  couponCode: Variables['applyCheckoutCouponInput']['data']['couponCode'];
}

export const applyCouponCode = async ({ checkoutEntityId, couponCode }: Props) => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const response = await client.fetch({
    document: ApplyCheckoutCouponMutation,
    variables: {
      applyCheckoutCouponInput: {
        checkoutEntityId,
        data: {
          couponCode,
        },
      },
    },
    customerAccessToken,
    fetchOptions: doNotCachePolicy(),
  });

  const checkout = response.data.checkout.applyCheckoutCoupon?.checkout;

  revalidateTag(TAGS.cart);

  return checkout;
};
