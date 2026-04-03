'use server';

import { revalidateTag } from 'next/cache';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql, VariablesOf } from '~/client/graphql';
import { TAGS } from '~/client/tags';

const UnapplyCheckoutGiftCertificateMutation = graphql(`
  mutation UnapplyCheckoutGiftCertificateMutation(
    $unapplyCheckoutGiftCertificateInput: UnapplyCheckoutGiftCertificateInput!
  ) {
    checkout {
      unapplyCheckoutGiftCertificate(input: $unapplyCheckoutGiftCertificateInput) {
        checkout {
          entityId
        }
      }
    }
  }
`);

type Variables = VariablesOf<typeof UnapplyCheckoutGiftCertificateMutation>;

interface Props {
  checkoutEntityId: Variables['unapplyCheckoutGiftCertificateInput']['checkoutEntityId'];
  giftCertificateCode: Variables['unapplyCheckoutGiftCertificateInput']['data']['giftCertificateCode'];
}

export const removeGiftCertificate = async ({ checkoutEntityId, giftCertificateCode }: Props) => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const response = await client.fetch({
    document: UnapplyCheckoutGiftCertificateMutation,
    variables: {
      unapplyCheckoutGiftCertificateInput: {
        checkoutEntityId,
        data: {
          giftCertificateCode,
        },
      },
    },
    customerAccessToken,
    fetchOptions: { cache: 'no-store' },
  });

  const checkout = response.data.checkout.unapplyCheckoutGiftCertificate?.checkout;

  revalidateTag(TAGS.checkout);

  return checkout;
};
