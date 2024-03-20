import { client } from '..';
import { RegisterCustomerInput } from '../generated/graphql';
import { graphql } from '../graphql';

interface RegisterCustomer {
  formFields: RegisterCustomerInput;
  reCaptchaToken?: string;
}

const REGISTER_CUSTOMER_MUTATION = graphql(`
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
`);

export const registerCustomer = async ({ formFields, reCaptchaToken }: RegisterCustomer) => {
  const variables = {
    input: formFields,
    ...(reCaptchaToken && { reCaptchaV2: { token: reCaptchaToken } }),
  };

  const response = await client.fetch({
    document: REGISTER_CUSTOMER_MUTATION,
    variables,
  });

  return response.data.customer.registerCustomer;
};
