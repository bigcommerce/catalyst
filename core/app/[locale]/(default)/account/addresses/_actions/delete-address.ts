'use server';

import { revalidatePath } from 'next/cache';
import { getTranslations } from 'next-intl/server';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';

import { State } from '../../settings/change-password/_actions/change-password';

const DeleteCustomerAddressMutation = graphql(`
  mutation DeleteCustomerAddressMutation($input: DeleteCustomerAddressInput!) {
    customer {
      deleteCustomerAddress(input: $input) {
        errors {
          __typename
          ... on CustomerAddressDeletionError {
            __typename
            message
          }
          ... on CustomerNotLoggedInError {
            __typename
            message
          }
        }
      }
    }
  }
`);

export const deleteAddress = async (addressId: number): Promise<State> => {
  const t = await getTranslations('Account.Addresses.Delete');
  const customerAccessToken = await getSessionCustomerAccessToken();

  try {
    const response = await client.fetch({
      document: DeleteCustomerAddressMutation,
      customerAccessToken,
      fetchOptions: { cache: 'no-store' },
      variables: {
        input: {
          addressEntityId: addressId,
        },
      },
    });

    const result = response.data.customer.deleteCustomerAddress;

    revalidatePath('/account/addresses', 'page');

    if (result.errors.length === 0) {
      return { status: 'success', messages: [t('success')] };
    }

    return {
      status: 'error',
      messages: result.errors.map((error) => error.message),
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return {
        status: 'error',
        messages: [error.message],
      };
    }

    return { status: 'error', messages: [t('error')] };
  }
};
