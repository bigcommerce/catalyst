import { z } from 'zod';

import { client } from '..';
import { graphql } from '../graphql';

export const ResetPasswordSchema = z.object({
  email: z.string().email(),
});

type SubmitResetPassword = z.infer<typeof ResetPasswordSchema> & {
  path: string;
  reCaptchaToken?: string;
};

const SUBMIT_RESET_PASSWORD_MUTATION = graphql(`
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
`);

export const submitResetPassword = async ({ email, path, reCaptchaToken }: SubmitResetPassword) => {
  const variables = {
    input: {
      email,
      path,
    },
    ...(reCaptchaToken && { reCaptchaV2: { token: reCaptchaToken } }),
  };

  const response = await client.fetch({
    document: SUBMIT_RESET_PASSWORD_MUTATION,
    variables,
  });

  return response.data;
};
