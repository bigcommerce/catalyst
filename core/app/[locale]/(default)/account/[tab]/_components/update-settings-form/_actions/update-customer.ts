'use server';

import { revalidatePath } from 'next/cache';

import { parseAccountFormData } from '~/app/[locale]/(default)/login/register-customer/_components/register-customer-form/fields/parse-fields';
import { getSessionCustomerId } from '~/auth';
import { client } from '~/client';
import { graphql, VariablesOf } from '~/client/graphql';

const UpdateCustomerMutation = graphql(`
  mutation UpdateCustomerMutation($input: UpdateCustomerInput!, $reCaptchaV2: ReCaptchaV2Input) {
    customer {
      updateCustomer(input: $input, reCaptchaV2: $reCaptchaV2) {
        customer {
          firstName
          lastName
        }
        errors {
          __typename
          ... on UnexpectedUpdateCustomerError {
            message
          }
          ... on EmailAlreadyInUseError {
            message
          }
          ... on ValidationError {
            message
          }
          ... on CustomerDoesNotExistError {
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

type CustomerAddressInput = VariablesOf<typeof UpdateCustomerMutation>['input'];

const isUpdateCustomerInput = (data: unknown): data is CustomerAddressInput => {
  if (
    typeof data === 'object' &&
    data !== null &&
    ('firstName' in data ||
      'lastName' in data ||
      'email' in data ||
      'phone' in data ||
      'company' in data ||
      'formFields' in data)
  ) {
    return true;
  }

  return false;
};

interface UpdateCustomerForm {
  formData: FormData;
  reCaptchaToken?: string;
}

export const updateCustomer = async ({ formData, reCaptchaToken }: UpdateCustomerForm) => {
  const customerId = await getSessionCustomerId();

  formData.delete('g-recaptcha-response');

  const parsed = parseAccountFormData(formData);

  if (!isUpdateCustomerInput(parsed)) {
    return {
      status: 'error',
      error: 'Something went wrong with proccessing user input.',
    };
  }

  const response = await client.fetch({
    document: UpdateCustomerMutation,
    customerId,
    fetchOptions: { cache: 'no-store' },
    variables: {
      input: parsed,
      ...(reCaptchaToken && { reCaptchaV2: { token: reCaptchaToken } }),
    },
  });

  revalidatePath('/account/settings', 'page');

  const result = response.data.customer.updateCustomer;

  if (result.errors.length === 0) {
    const { customer } = result;

    if (!customer) {
      return {
        status: 'error',
        error: 'Customer does not exist',
      };
    }

    const { firstName, lastName } = customer;

    return { status: 'success', data: { firstName, lastName } };
  }

  return {
    status: 'error',
    error: result.errors.map((error) => error.message).join('\n'),
  };
};
