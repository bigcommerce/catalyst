'use server';

import { getTranslations } from 'next-intl/server';
import { z } from 'zod';

import { client } from '~/client';
import { graphql } from '~/client/graphql';

const ContactUsSchema = z.object({
  companyName: z.string().optional(),
  fullName: z.string().optional(),
  phoneNumber: z.string().optional(),
  orderNumber: z.string().optional(),
  rmaNumber: z.string().optional(),
  email: z.string().email(),
  comments: z.string().trim(),
});

const SubmitContactUsMutation = graphql(`
  mutation SubmitContactUsMutation($input: SubmitContactUsInput!, $reCaptchaV2: ReCaptchaV2Input) {
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
`);

interface SubmitContactForm {
  formData: FormData;
  pageEntityId: number;
  reCaptchaToken: string;
}

export const submitContactForm = async ({
  formData,
  pageEntityId,
  reCaptchaToken,
}: SubmitContactForm) => {
  const t = await getTranslations('WebPages.ContactUs.Form');

  try {
    const parsedData = ContactUsSchema.parse({
      email: formData.get('email'),
      comments: formData.get('comments'),
      companyName: formData.get('companyname'),
      fullName: formData.get('fullname'),
      phoneNumber: formData.get('phone'),
      orderNumber: formData.get('orderno'),
      rmaNumber: formData.get('rma'),
    });

    const response = await client.fetch({
      document: SubmitContactUsMutation,
      variables: {
        input: {
          pageEntityId,
          data: parsedData,
        },
        ...(reCaptchaToken && { reCaptchaV2: { token: reCaptchaToken } }),
      },
    });

    const result = response.data.submitContactUs;

    if (result.errors.length === 0) {
      return { status: 'success', data: parsedData };
    }

    return {
      status: 'error',
      error: result.errors.map((error) => error.message).join('\n'),
    };
  } catch (error: unknown) {
    if (error instanceof Error || error instanceof z.ZodError) {
      return { status: 'error', error: error.message };
    }

    return { status: 'error', error: t('error') };
  }
};
