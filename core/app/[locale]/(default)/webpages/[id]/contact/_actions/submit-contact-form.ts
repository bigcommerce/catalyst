'use server';

import { BigCommerceGQLError } from '@bigcommerce/catalyst-client';
import { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { getLocale, getTranslations } from 'next-intl/server';
import { z } from 'zod';

import { Field, FieldGroup, schema } from '@/vibes/soul/form/dynamic-form/schema';
import { client } from '~/client';
import { graphql, VariablesOf } from '~/client/graphql';
import { redirect } from '~/i18n/routing';

const inputSchema = z.object({
  data: z.object({
    companyName: z.string().optional(),
    fullName: z.string().optional(),
    phoneNumber: z.string().optional(),
    orderNumber: z.string().optional(),
    rmaNumber: z.string().optional(),
    email: z.string().email(),
    comments: z.string().trim(),
  }),
  pageEntityId: z.number(),
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

function parseContactFormInput(
  value: Record<string, string | number | string[] | undefined>,
): VariablesOf<typeof SubmitContactUsMutation>['input'] {
  const mappedInput = {
    data: {
      companyName: value.companyname,
      fullName: value.fullname,
      phoneNumber: value.phone,
      orderNumber: value.orderno,
      rmaNumber: value.rma,
      email: value.email,
      comments: value.comments,
    },
    pageEntityId: Number(value.pageId),
  };

  return inputSchema.parse(mappedInput);
}

export async function submitContactForm<F extends Field>(
  prevState: { lastResult: SubmissionResult | null; fields: Array<F | FieldGroup<F>> },
  formData: FormData,
) {
  const t = await getTranslations('WebPages.ContactUs.Form');
  const locale = await getLocale();

  const submission = parseWithZod(formData, { schema: schema(prevState.fields) });

  if (submission.status !== 'success') {
    return {
      lastResult: submission.reply(),
      fields: prevState.fields,
    };
  }

  try {
    const input = parseContactFormInput(submission.value);
    const response = await client.fetch({
      document: SubmitContactUsMutation,
      variables: {
        input,
        // ...(recaptchaToken && { reCaptchaV2: { token: recaptchaToken } }),
      },
      fetchOptions: { cache: 'no-store' },
    });

    const result = response.data.submitContactUs;

    if (result.errors.length > 0) {
      return {
        lastResult: submission.reply({ formErrors: result.errors.map((error) => error.message) }),
        fields: prevState.fields,
      };
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    if (error instanceof BigCommerceGQLError) {
      return {
        lastResult: submission.reply({
          formErrors: error.errors.map(({ message }) => message),
        }),
        fields: prevState.fields,
      };
    }

    if (error instanceof Error) {
      return {
        lastResult: submission.reply({ formErrors: [error.message] }),
        fields: prevState.fields,
      };
    }

    return {
      lastResult: submission.reply({ formErrors: [t('somethingWentWrong')] }),
      fields: prevState.fields,
    };
  }

  return redirect({
    href: {
      pathname: String(submission.value.pagePath),
      query: { success: 'true' },
    },
    locale,
  });
}
