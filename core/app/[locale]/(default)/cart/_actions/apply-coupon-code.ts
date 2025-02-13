'use server';

import { revalidateTag } from 'next/cache';
import { z } from 'zod';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql, VariablesOf } from '~/client/graphql';
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

type Variables = VariablesOf<typeof ApplyCheckoutCouponMutation>;

interface Props {
  checkoutEntityId: Variables['applyCheckoutCouponInput']['checkoutEntityId'];
  couponCode: Variables['applyCheckoutCouponInput']['data']['couponCode'];
}

export const applyCouponCode = async ({ checkoutEntityId, couponCode }: Props) => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  // TODO: parse data from somewhere else?
  const parsedData = ApplyCouponCodeSchema.parse({
    checkoutEntityId,
    couponCode,
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

  revalidateTag(TAGS.checkout);

  return checkout;
};
