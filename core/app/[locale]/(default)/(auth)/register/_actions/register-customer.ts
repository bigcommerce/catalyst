'use server';

import { BigCommerceAPIError } from '@bigcommerce/catalyst-client';
import { getTranslations } from 'next-intl/server';

import { client } from '~/client';
import { graphql, VariablesOf } from '~/client/graphql';
import { parseRegisterCustomerFormData } from '~/components/form-fields/shared/parse-fields';

const RegisterCustomerMutation = graphql(`
  mutation RegisterCustomer($input: RegisterCustomerInput!, $reCaptchaV2: ReCaptchaV2Input) {
    customer {
      registerCustomer(input: $input, reCaptchaV2: $reCaptchaV2) {
        customer {
          firstName
          lastName
        }
        errors {
          ... on EmailAlreadyInUseError {
            message
          }
          ... on AccountCreationDisabledError {
            message
          }
          ... on CustomerRegistrationError {
            message
          }
          ... on ValidationError {
            message
          }
        }
      }
    }
  }
`);

type Variables = VariablesOf<typeof RegisterCustomerMutation>;
type RegisterCustomerInput = Variables['input'];

interface RegisterCustomerForm {
  formData: FormData;
  reCaptchaToken?: string;
}

const isRegisterCustomerInput = (data: unknown): data is RegisterCustomerInput => {
  if (typeof data === 'object' && data !== null && 'email' in data) {
    return true;
  }

  return false;
};

export const registerCustomer = async ({ formData, reCaptchaToken }: RegisterCustomerForm) => {
  const t = await getTranslations('Register');

  formData.delete('customer-confirmPassword');

  const parsedData = parseRegisterCustomerFormData(formData);

  if (!isRegisterCustomerInput(parsedData)) {
    return {
      status: 'error',
      error: t('Errors.inputError'),
    };
  }

  try {
    const response = await client.fetch({
      document: RegisterCustomerMutation,
      variables: {
        input: parsedData,
        ...(reCaptchaToken && { reCaptchaV2: { token: reCaptchaToken } }),
      },
      fetchOptions: {
        cache: 'no-store',
      },
    });

    const result = response.data.customer.registerCustomer;

    if (result.errors.length === 0) {
      return { status: 'success', data: parsedData };
    }

    return {
      status: 'error',
      error: result.errors.map((error) => error.message).join('\n'),
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    if (error instanceof BigCommerceAPIError) {
      return {
        status: 'error',
        error: t('Errors.apiError'),
      };
    }

    return {
      status: 'error',
      error: t('Errors.error'),
    };
  }
};
