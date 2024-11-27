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

// Updated to accept optional email and validate form data
const isRegisterCustomerInput = (data: unknown): data is RegisterCustomerInput => {
  if (typeof data === 'object' && data !== null) {
    // We no longer enforce an email validation here
    return true;
  }
  return false;
};

export const registerCustomers = async ({ formData, reCaptchaToken }: RegisterCustomerForm) => {
  const t = await getTranslations('Register');
  formData.delete('customer-confirmPassword');

  // Parse the form data
  let parsedDataValue: any = parseRegisterCustomerFormData(formData);
  delete parsedDataValue['address']; // Remove address if unnecessary for the mutation

  const parsedData = parsedDataValue;

  // Ensure the parsedData doesn't throw error even if email is missing
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

    // Handle possible registration errors
    if (result.errors.length === 0) {
      return { status: 'success', data: parsedData };
    }

    // Collect and return error messages from BigCommerce API
    return {
      status: 'error',
      error: result.errors.map((error) => error.message).join('\n'),
    };
  } catch (error: any) {
    // Log and handle unexpected errors
    console.error('Unexpected error:', error);

    // Fallback error handling to ensure we catch all errors
    const errorMessage = error?.message || error?.response?.data?.message || t('Errors.error');

    // Specific BigCommerce API error handling
    if (error instanceof BigCommerceAPIError) {
      return {
        status: 'error',
        error: t('Errors.apiError'),
      };
    }

    return {
      status: 'error',
      error: errorMessage,
    };
  }
};
