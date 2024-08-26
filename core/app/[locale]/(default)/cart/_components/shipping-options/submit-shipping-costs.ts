'use server';

import { revalidateTag } from 'next/cache';
import { z } from 'zod';

import { getSessionCustomerId } from '~/auth';
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

const ShippingCostSchema = z.object({
  shippingOption: z.string(),
});

export const submitShippingCosts = async (
  formData: FormData,
  checkoutEntityId: string,
  consignmentEntityId: string,
) => {
  const customerId = await getSessionCustomerId();

  try {
    const parsedData = ShippingCostSchema.parse({
      shippingOption: formData.get('shippingOption'),
    });

    const response = await client.fetch({
      document: SelectCheckoutShippingOptionMutation,
      variables: {
        input: {
          checkoutEntityId,
          consignmentEntityId,
          data: {
            shippingOptionEntityId: parsedData.shippingOption,
          },
        },
      },
      customerId,
      fetchOptions: { cache: 'no-store' },
    });

    const shippingCost = response.data.checkout.selectCheckoutShippingOption?.checkout;

    if (!shippingCost?.entityId) {
      return { status: 'error', error: 'Failed to submit shipping cost.' };
    }

    revalidateTag(TAGS.checkout);

    return { status: 'success', data: shippingCost };
  } catch (error: unknown) {
    if (error instanceof Error || error instanceof z.ZodError) {
      return { status: 'error', error: error.message };
    }

    return { status: 'error', error: 'Failed to submit shipping cost.' };
  }
};
