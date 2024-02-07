import { z } from 'zod';

import { client } from '..';
import { graphql } from '../generated';

export const ContactUsSchema = z.object({
  companyName: z.string().optional(),
  fullName: z.string().optional(),
  phoneNumber: z.string().optional(),
  orderNumber: z.string().optional(),
  rmaNumber: z.string().optional(),
  email: z.string().email(),
  comments: z.string().trim(),
});

interface SubmitContactForm {
  formFields: z.infer<typeof ContactUsSchema>;
  pageEntityId: number;
  reCaptchaToken?: string;
}

const SUBMIT_CONTACT_FORM_MUTATION = /* GraphQL */ `
  mutation submitContactUs($input: SubmitContactUsInput!, $reCaptchaV2: ReCaptchaV2Input) {
    submitContactUs(input: $input, reCaptchaV2: $reCaptchaV2) {
      __typename
      errors {
        __typename
        ... on Error {
          message
        }
      }
    }
  }
`;

export const submitContactForm = async ({
  formFields,
  pageEntityId,
  reCaptchaToken,
}: SubmitContactForm) => {
  const mutation = graphql(SUBMIT_CONTACT_FORM_MUTATION);

  const variables = {
    input: {
      pageEntityId,
      data: formFields,
    },
    ...(reCaptchaToken && { reCaptchaV2: { token: reCaptchaToken } }),
  };

  const response = await client.fetch({
    document: mutation,
    variables,
  });

  return response.data;
};
