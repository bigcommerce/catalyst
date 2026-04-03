'use server';

import { revalidateTag } from 'next/cache';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql, VariablesOf } from '~/client/graphql';
import { TAGS } from '~/client/tags';

const ApplyCheckoutGiftCertificateMutation = graphql(`
  mutation ApplyCheckoutGiftCertificateMutation(
    $applyCheckoutGiftCertificateInput: ApplyCheckoutGiftCertificateInput!
  ) {
    checkout {
      applyCheckoutGiftCertificate(input: $applyCheckoutGiftCertificateInput) {
        checkout {
          entityId
        }
      }
    }
  }
`);

type Variables = VariablesOf<typeof ApplyCheckoutGiftCertificateMutation>;

interface Props {
  checkoutEntityId: Variables['applyCheckoutGiftCertificateInput']['checkoutEntityId'];
  giftCertificateCode: Variables['applyCheckoutGiftCertificateInput']['data']['giftCertificateCode'];
}

export const applyGiftCertificate = async ({ checkoutEntityId, giftCertificateCode }: Props) => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const response = await client.fetch({
    document: ApplyCheckoutGiftCertificateMutation,
    variables: {
      applyCheckoutGiftCertificateInput: {
        checkoutEntityId,
        data: {
          giftCertificateCode,
        },
      },
    },
    customerAccessToken,
    fetchOptions: { cache: 'no-store' },
  });

  const checkout = response.data.checkout.applyCheckoutGiftCertificate?.checkout;

  revalidateTag(TAGS.checkout);

  return checkout;
};
