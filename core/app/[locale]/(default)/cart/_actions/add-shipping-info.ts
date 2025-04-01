'use server';

import { revalidateTag } from 'next/cache';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { TAGS } from '~/client/tags';

const AddCheckoutShippingConsignmentsMutation = graphql(`
  mutation AddCheckoutShippingConsignments($input: AddCheckoutShippingConsignmentsInput!) {
    checkout {
      addCheckoutShippingConsignments(input: $input) {
        checkout {
          entityId
          shippingConsignments {
            availableShippingOptions {
              cost {
                value
              }
              description
              entityId
            }
          }
        }
      }
    }
  }
`);

interface AddProps {
  checkoutEntityId: string;
  address: {
    countryCode: string;
    city?: string;
    stateOrProvince?: string;
    postalCode?: string;
  };
  lineItems: Array<{ quantity: number; lineItemEntityId: string }>;
}

export const addCheckoutShippingConsignments = async ({
  checkoutEntityId,
  address,
  lineItems,
}: AddProps) => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const response = await client.fetch({
    document: AddCheckoutShippingConsignmentsMutation,
    variables: {
      input: {
        checkoutEntityId,
        data: {
          consignments: [
            {
              address: {
                ...address,
                shouldSaveAddress: false,
              },
              lineItems,
            },
          ],
        },
      },
    },
    customerAccessToken,
    fetchOptions: { cache: 'no-store' },
  });

  revalidateTag(TAGS.checkout);

  return response.data.checkout.addCheckoutShippingConsignments?.checkout;
};

const UpdateCheckoutShippingConsignmentMutation = graphql(`
  mutation UpdateCheckoutShippingConsignment($input: UpdateCheckoutShippingConsignmentInput!) {
    checkout {
      updateCheckoutShippingConsignment(input: $input) {
        checkout {
          entityId
          shippingConsignments {
            availableShippingOptions {
              cost {
                value
              }
              description
              entityId
            }
          }
        }
      }
    }
  }
`);

interface UpdateProps {
  checkoutEntityId: string;
  shippingId: string;
  address: {
    countryCode: string;
    city?: string;
    stateOrProvince?: string;
    postalCode?: string;
  };
  lineItems: Array<{ quantity: number; lineItemEntityId: string }>;
}

export const updateCheckoutShippingConsignment = async ({
  checkoutEntityId,
  address,
  shippingId,
  lineItems,
}: UpdateProps) => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const response = await client.fetch({
    document: UpdateCheckoutShippingConsignmentMutation,
    variables: {
      input: {
        checkoutEntityId,
        consignmentEntityId: shippingId,
        data: {
          consignment: {
            address: {
              ...address,
              shouldSaveAddress: false,
            },
            lineItems,
          },
        },
      },
    },
    customerAccessToken,
    fetchOptions: { cache: 'no-store' },
  });

  revalidateTag(TAGS.checkout);

  return response.data.checkout.updateCheckoutShippingConsignment?.checkout;
};
