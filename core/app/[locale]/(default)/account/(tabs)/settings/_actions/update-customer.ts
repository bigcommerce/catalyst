'use server';

import { getSessionCustomerId } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';

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

interface UpdateCustomerForm {
  formData: FormData;
  reCaptchaToken?: string;
}

export const updateCustomer = async ({ formData, reCaptchaToken }: UpdateCustomerForm) => {
  const customerId = await getSessionCustomerId();

  formData.delete('g-recaptcha-response');

  const formFields = Object.fromEntries(formData.entries());

  const response = await client.fetch({
    document: UpdateCustomerMutation,
    customerId,
    fetchOptions: { cache: 'no-store' },
    variables: {
      input: formFields,
      ...(reCaptchaToken && { reCaptchaV2: { token: reCaptchaToken } }),
    },
  });

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
