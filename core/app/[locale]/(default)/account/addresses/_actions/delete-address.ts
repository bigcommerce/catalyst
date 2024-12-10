'use server';

import { revalidateTag } from 'next/cache';
import { getTranslations } from 'next-intl/server';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { TAGS } from '~/client/tags';

const DeleteCustomerAddressMutation = graphql(`
  mutation DeleteCustomerAddressMutation(
    $reCaptcha: ReCaptchaV2Input
    $input: DeleteCustomerAddressInput!
  ) {
    customer {
      deleteCustomerAddress(reCaptchaV2: $reCaptcha, input: $input) {
        errors {
          __typename
          ... on CustomerAddressDeletionError {
            message
          }
          ... on CustomerNotLoggedInError {
            message
          }
        }
      }
    }
  }
`);

interface DeleteAddressResponse {
  status: 'success' | 'error';
  message: string;
}

export const deleteAddress = async (addressId: number): Promise<DeleteAddressResponse> => {
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

    if (result.errors.length > 0) {
      result.errors.forEach((error) => {
        // Throw the first error message, as we should only handle one error at a time
        throw new Error(error.message);
      });
    }

    revalidateTag(TAGS.customer);

    return { status: 'success', message: t('success') };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return {
        status: 'error',
        message: error.message,
      };
    }

    return { status: 'error', message: t('error') };
  }
};
