import { z } from 'zod';

import { client } from '..';
import { graphql } from '../generated';

export const ResetPasswordSchema = z.object({
  email: z.string().email(),
});

type SubmitResetPassword = z.infer<typeof ResetPasswordSchema> & {
  reCaptchaToken?: string;
};

const SUBMIT_RESET_PASSWORD_MUTATION = /* GraphQL */ `
  mutation ResetPassword($input: RequestResetPasswordInput!, $reCaptcha: ReCaptchaV2Input) {
    customer {
      requestResetPassword(input: $input, reCaptchaV2: $reCaptcha) {
        __typename
        errors {
          __typename
          ... on Error {
            message
          }
        }
      }
    }
  }
`;

export const submitResetPassword = async ({ email, reCaptchaToken }: SubmitResetPassword) => {
  const mutation = graphql(SUBMIT_RESET_PASSWORD_MUTATION);

  const variables = {
    input: {
      email,
    },
    ...(reCaptchaToken && { reCaptchaV2: { token: reCaptchaToken } }),
  };

  const response = await client.fetch({
    document: mutation,
    variables,
  });

  return response.data;
};
