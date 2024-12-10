'use server';

import { revalidatePath } from 'next/cache';
import { getTranslations } from 'next-intl/server';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql, VariablesOf } from '~/client/graphql';
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

export const updateAddress = async (formData: FormData, addressId: number) => {
  const t = await getTranslations('Account.Addresses.Edit.Form');
  const customerAccessToken = await getSessionCustomerAccessToken();

  try {
    const parsed = parseAccountFormData(formData);

    if (!isUpdateCustomerAddressInput(parsed)) {
      return {
        status: 'error',
        errors: [t('Errors.inputError')],
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

    return { status: 'error', messages: [t('Errors.error')] };
  }
};
