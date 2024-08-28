'use server';

import { revalidatePath } from 'next/cache';

import { getSessionCustomerId } from '~/auth';
import { client } from '~/client';
import { graphql, VariablesOf } from '~/client/graphql';

const UpdateCustomerAddressMutation = graphql(`
  mutation UpdateCustomerAddressMutation(
    $input: UpdateCustomerAddressInput!
    $reCaptchaV2: ReCaptchaV2Input
  ) {
    customer {
      updateCustomerAddress(input: $input, reCaptchaV2: $reCaptchaV2) {
        errors {
          __typename
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

export const updateAddress = async ({
  addressId,
  formData,
  reCaptchaToken,
}: {
  addressId: number;
  formData: FormData;
  reCaptchaToken?: string;
}) => {
  const customerId = await getSessionCustomerId();

  try {
    const parsed: unknown = [...formData.entries()].reduce<
      Record<string, FormDataEntryValue | Record<string, FormDataEntryValue>>
    >((parsedData, [name, value]) => {
      const key = name.split('-').at(-1) ?? '';
      const sections = name.split('-').slice(0, -1);

      if (sections.includes('customer')) {
        parsedData[key] = value;
      }

      if (sections.includes('address')) {
        parsedData[key] = value;
      }

      return parsedData;
    }, {});

    if (!isUpdateCustomerAddressInput(parsed)) {
      return {
        status: 'error',
        error: 'Something went wrong with proccessing user input.',
      };
    }

    const response = await client.fetch({
      document: UpdateCustomerAddressMutation,
      customerId,
      fetchOptions: { cache: 'no-store' },
      variables: {
        input: {
          addressEntityId: addressId,
          data: parsed,
        },
        ...(reCaptchaToken && { reCaptchaV2: { token: reCaptchaToken } }),
      },
    });

    const result = response.data.customer.updateCustomerAddress;

    revalidatePath('/account/addresses', 'page');

    if (result.errors.length === 0) {
      return { status: 'success', message: 'The address has been updated.' };
    }

    return {
      status: 'error',
      message: result.errors
        .map((error) => {
          if (error.__typename === 'AddressDoesNotExistError') {
            return 'Address does not exist.';
          }

          return error.message;
        })
        .join('\n'),
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
