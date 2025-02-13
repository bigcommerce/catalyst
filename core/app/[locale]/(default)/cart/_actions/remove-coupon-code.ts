'use server';

import { revalidateTag } from 'next/cache';
import { z } from 'zod';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql, VariablesOf } from '~/client/graphql';
import { TAGS } from '~/client/tags';

const RemoveCouponCodeSchema = z.object({
  checkoutEntityId: z.string(),
  couponCode: z.string(),
});

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

  // TODO: parse data from somewhere else?
  const parsedData = RemoveCouponCodeSchema.parse({
    checkoutEntityId,
    couponCode,
  });

  const response = await client.fetch({
    document: UnapplyCheckoutCouponMutation,
    variables: {
      unapplyCheckoutCouponInput: {
        checkoutEntityId: parsedData.checkoutEntityId,
        data: {
          couponCode: parsedData.couponCode,
        },
      },
    },
    customerAccessToken,
    fetchOptions: { cache: 'no-store' },
  });

  const checkout = response.data.checkout.unapplyCheckoutCoupon?.checkout;

  revalidateTag(TAGS.checkout);

  return checkout;
};
