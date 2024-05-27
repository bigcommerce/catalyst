'use server';

import { revalidatePath } from 'next/cache';

import { getSessionCustomerId } from '~/auth';
import { client } from '~/client';
import { graphql, VariablesOf } from '~/client/graphql';

const AddCustomerAddressMutation = graphql(`
  mutation AddCustomerAddressMutation(
    $input: AddCustomerAddressInput!
    $reCaptchaV2: ReCaptchaV2Input
  ) {
    customer {
      addCustomerAddress(input: $input, reCaptchaV2: $reCaptchaV2) {
        errors {
          ... on CustomerAddressCreationError {
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

type Variables = VariablesOf<typeof AddCustomerAddressMutation>;
type AddCustomerAddressInput = Variables['input'];

import { parseAccountFormData } from '../../../login/register-customer/_components/register-customer-form/fields/parse-fields';

const isAddCustomerAddressInput = (data: unknown): data is AddCustomerAddressInput => {
  if (typeof data === 'object' && data !== null && 'address1' in data) {
    return true;
  }

  return false;
};

export const addAddress = async ({
  formData,
  reCaptchaToken,
}: {
  formData: FormData;
  reCaptchaToken?: string;
}) => {
  const customerId = await getSessionCustomerId();

  try {
    const parsed = parseAccountFormData(formData);

    if (!isAddCustomerAddressInput(parsed)) {
      return {
        status: 'error',
        error: 'Something went wrong with proccessing user input.',
      };
    }

    const response = await client.fetch({
      document: AddCustomerAddressMutation,
      customerId,
      fetchOptions: { cache: 'no-store' },
      variables: {
        input: parsed,
        ...(reCaptchaToken && { reCaptchaV2: { token: reCaptchaToken } }),
      },
    });

    const result = response.data.customer.addCustomerAddress;

    revalidatePath('/account/addresses', 'page');

    if (result.errors.length === 0) {
      return { status: 'success', message: 'The address has been added.' };
    }

    return {
      status: 'error',
      message: result.errors.map((error) => error.message).join('\n'),
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return {
        status: 'error',
        message: error.message,
      };
    }

    return { status: 'error', message: 'Unknown error.' };
  }
};
