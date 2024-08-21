'use server';

import { revalidateTag } from 'next/cache';
import { z } from 'zod';

import { getSessionCustomerId } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { TAGS } from '~/client/tags';

const UpdateCheckoutShippingConsignmentMutation = graphql(`
  mutation UpdateCheckoutShippingConsignment($input: UpdateCheckoutShippingConsignmentInput!) {
    checkout {
      updateCheckoutShippingConsignment(input: $input) {
        checkout {
          entityId
        }
      }
    }
  }
`);

const AddCheckoutShippingConsignmentsMutation = graphql(`
  mutation AddCheckoutShippingConsignments($input: AddCheckoutShippingConsignmentsInput!) {
    checkout {
      addCheckoutShippingConsignments(input: $input) {
        checkout {
          entityId
        }
      }
    }
  }
`);

const ShippingInfoSchema = z.object({
  country: z.string(),
  state: z.string().optional(),
  city: z.string().optional(),
  zipcode: z.string().optional(),
});

export const submitShippingInfo = async (
  formData: FormData,
  checkoutData: {
    checkoutId: string;
    shippingId: string | null;
    lineItems: Array<{ quantity: number; lineItemEntityId: string }>;
  },
) => {
  const customerId = await getSessionCustomerId();

  try {
    const parsedData = ShippingInfoSchema.parse({
      country: formData.get('country'),
      state: formData.get('state'),
      city: formData.get('city'),
      zipcode: formData.get('zip'),
    });
    const { checkoutId, lineItems, shippingId } = checkoutData;

    let result;

    if (shippingId) {
      const response = await client.fetch({
        document: UpdateCheckoutShippingConsignmentMutation,
        variables: {
          input: {
            checkoutEntityId: checkoutId,
            consignmentEntityId: shippingId,
            data: {
              consignment: {
                address: {
                  countryCode: parsedData.country.split('-')[0] ?? '',
                  city: parsedData.city,
                  stateOrProvince: parsedData.state,
                  shouldSaveAddress: false,
                  postalCode: parsedData.zipcode,
                },
                lineItems,
              },
            },
          },
        },
        customerId,
        fetchOptions: { cache: 'no-store' },
      });

      result = response.data.checkout.updateCheckoutShippingConsignment?.checkout;
    } else {
      const response = await client.fetch({
        document: AddCheckoutShippingConsignmentsMutation,
        variables: {
          input: {
            checkoutEntityId: checkoutId,
            data: {
              consignments: [
                {
                  address: {
                    countryCode: parsedData.country.split('-')[0] ?? '',
                    city: parsedData.city,
                    stateOrProvince: parsedData.state,
                    shouldSaveAddress: false,
                    postalCode: parsedData.zipcode,
                  },
                  lineItems,
                },
              ],
            },
          },
        },
        customerId,
        fetchOptions: { cache: 'no-store' },
      });

      result = response.data.checkout.addCheckoutShippingConsignments?.checkout;
    }

    if (!result?.entityId) {
      return { status: 'error', error: 'Failed to submit shipping info.' };
    }

    revalidateTag(TAGS.checkout);

    return { status: 'success', data: result };
  } catch (error: unknown) {
    if (error instanceof Error || error instanceof z.ZodError) {
      return { status: 'error', error: error.message };
    }

    return { status: 'error', error: 'Failed to submit shipping info.' };
  }
};
