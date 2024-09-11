'use server';

import { revalidatePath } from 'next/cache';
import { getTranslations } from 'next-intl/server';

import { getSessionCustomerId } from '~/auth';
import { client } from '~/client';
import { graphql, VariablesOf } from '~/client/graphql';
import { parseAccountFormData } from '~/components/form-fields/shared/parse-fields';

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

type AddCustomerAddressInput = VariablesOf<typeof UpdateCustomerMutation>['input'];

const isUpdateCustomerInput = (data: unknown): data is AddCustomerAddressInput => {
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
  const t = await getTranslations('Account.Settings.UpdateCustomer');

  const customerId = await getSessionCustomerId();

  formData.delete('g-recaptcha-response');

  const parsed = parseAccountFormData(formData);

  if (!isUpdateCustomerInput(parsed)) {
    return {
      status: 'error',
      error: t('Errors.inputError'),
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
        error: t('Errors.notFound'),
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
