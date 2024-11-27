'use server';

import { BigCommerceAPIError } from '@bigcommerce/catalyst-client';
import { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { getTranslations } from 'next-intl/server';

import { schema } from '@/vibes/soul/sections/sign-up-section/schema';
import { client } from '~/client';
import { graphql } from '~/client/graphql';

import { login } from '../../login/_actions/login';

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

export const registerCustomer = async (
  _lastResult: SubmissionResult | null,
  formData: FormData,
  // TODO: add recaptcha token
  // reCaptchaToken
) => {
  const t = await getTranslations('Register');
  formData.delete('customer-confirmPassword');
  let parsedDataValue: any = parseRegisterCustomerFormData(formData);
  delete parsedDataValue['address'];
  const parsedData = parsedDataValue;
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
        input: submission.value,
        // ...(reCaptchaToken && { reCaptchaV2: { token: reCaptchaToken } }),
      },
      fetchOptions: {
        cache: 'no-store',
      },
    });

    const result = response.data.customer.registerCustomer;

    if (result.errors.length === 0) {
      void login(null, formData);

      return submission.reply({ resetForm: true });
    }

    return submission.reply({ formErrors: result.errors.map((error) => error.message) });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    if (error instanceof BigCommerceAPIError) {
      return submission.reply({ formErrors: [t('Errors.apiError')] });
    }

    return submission.reply({ formErrors: [t('Errors.error')] });
  }
};
