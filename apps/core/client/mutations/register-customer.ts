import { client } from '..';
import { graphql } from '../generated';
import { RegisterCustomerInput } from '../generated/graphql';

interface RegisterCustomer {
  formFields: RegisterCustomerInput;
  reCaptchaToken?: string;
}

export const REGISTER_CUSTOMER_MUTATION = /* GraphQL */ `
  mutation registerCustomer($input: RegisterCustomerInput!, $reCaptchaV2: ReCaptchaV2Input) {
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
`;

export const registerCustomer = async ({ formFields, reCaptchaToken }: RegisterCustomer) => {
  const mutation = graphql(REGISTER_CUSTOMER_MUTATION);

  const variables = {
    input: formFields,
    ...(reCaptchaToken && { reCaptchaV2: { token: reCaptchaToken } }),
  };

  const response = await client.fetch({
    document: mutation,
    variables,
  });

  return response.data.customer.registerCustomer;
};
