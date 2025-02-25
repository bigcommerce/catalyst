'use server';

import { revalidateTag } from 'next/cache';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { TAGS } from '~/client/tags';

const SelectCheckoutShippingOptionMutation = graphql(`
  mutation SelectCheckoutShippingOption($input: SelectCheckoutShippingOptionInput!) {
    checkout {
      selectCheckoutShippingOption(input: $input) {
        checkout {
          entityId
        }
      }
    }
  }
`);

interface Props {
  checkoutEntityId: string;
  consignmentEntityId: string;
  shippingOptionEntityId: string;
}

export const addShippingCost = async ({
  checkoutEntityId,
  consignmentEntityId,
  shippingOptionEntityId,
}: Props) => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const response = await client.fetch({
    document: SelectCheckoutShippingOptionMutation,
    variables: {
      input: {
        checkoutEntityId,
        consignmentEntityId,
        data: {
          shippingOptionEntityId,
        },
      },
    },
    customerAccessToken,
    fetchOptions: { cache: 'no-store' },
  });

  const result = response.data.checkout.selectCheckoutShippingOption?.checkout;

  revalidateTag(TAGS.checkout);

  return result;
};
