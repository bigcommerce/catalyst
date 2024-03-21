import { client } from '..';
import { graphql, VariablesOf } from '../graphql';

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

type Variables = VariablesOf<typeof REGISTER_CUSTOMER_MUTATION>;
type Input = Variables['input'];

interface RegisterCustomer {
  formFields: Input;
  reCaptchaToken?: string;
}

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
