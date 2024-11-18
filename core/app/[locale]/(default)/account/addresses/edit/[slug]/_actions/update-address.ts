'use server';

import { expireTag } from 'next/cache';
import { getTranslations } from 'next-intl/server';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql, VariablesOf } from '~/client/graphql';
import { TAGS } from '~/client/tags';
import { parseAccountFormData } from '~/components/form-fields/shared/parse-fields';

const UpdateCustomerAddressMutation = graphql(`
  mutation UpdateCustomerAddressMutation($input: UpdateCustomerAddressInput!) {
    customer {
      updateCustomerAddress(input: $input) {
        errors {
          __typename
          ... on AddressDoesNotExistError {
            message
          }
          ... on CustomerAddressUpdateError {
            message
          }
          ... on CustomerNotLoggedInError {
            message
          }
          ... on ValidationError {
            message
            path
          }
        }
        address {
          entityId
          firstName
          lastName
        }
      }
    }
  }
`);

type Variables = VariablesOf<typeof UpdateCustomerAddressMutation>;
type UpdateCustomerAddressInput = Variables['input'];

const isUpdateCustomerAddressInput = (
  data: unknown,
): data is UpdateCustomerAddressInput['data'] => {
  if (typeof data === 'object' && data !== null && 'address1' in data) {
    return true;
  }

  return false;
};

interface UpdateAddressResponse {
  status: 'success' | 'error';
  message: string;
}

export const updateAddress = async (
  formData: FormData,
  addressId: number,
): Promise<UpdateAddressResponse> => {
  const t = await getTranslations('Account.Addresses.Edit.Form');
  const customerAccessToken = await getSessionCustomerAccessToken();

  try {
    const parsed = parseAccountFormData(formData);

    if (!isUpdateCustomerAddressInput(parsed)) {
      return {
        status: 'error',
        message: t('Errors.inputError'),
      };
    }

    const response = await client.fetch({
      document: UpdateCustomerAddressMutation,
      customerAccessToken,
      fetchOptions: { cache: 'no-store' },
      variables: {
        input: {
          addressEntityId: addressId,
          data: parsed,
        },
      },
    });

    const result = response.data.customer.updateCustomerAddress;

    if (result.errors.length > 0) {
      result.errors.forEach((error) => {
        // Throw the first error message, as we should only handle one error at a time
        throw new Error(error.message);
      });
    }

    expireTag(TAGS.customer);

    return { status: 'success', message: t('success') };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return {
        status: 'error',
        message: error.message,
      };
    }

    return { status: 'error', message: t('Errors.error') };
  }
};
