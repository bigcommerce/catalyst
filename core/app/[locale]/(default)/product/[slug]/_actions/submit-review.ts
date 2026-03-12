'use server';

import { BigCommerceGQLError } from '@bigcommerce/catalyst-client';
import { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { getTranslations } from 'next-intl/server';

import { schema } from '@/vibes/soul/sections/reviews/schema';
import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { assertRecaptchaTokenPresent, getRecaptchaFromForm } from '~/lib/recaptcha';

const AddProductReviewMutation = graphql(`
  mutation AddProductReviewMutation(
    $input: AddProductReviewInput!
    $reCaptchaV2: ReCaptchaV2Input
  ) {
    catalog {
      addProductReview(input: $input, reCaptchaV2: $reCaptchaV2) {
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

export async function submitReview(
  prevState: { lastResult: SubmissionResult | null; successMessage?: string },
  payload: FormData,
) {
  const t = await getTranslations('Product.Reviews.Form');
  const customerAccessToken = await getSessionCustomerAccessToken();
  const submission = parseWithZod(payload, { schema });

  if (submission.status !== 'success') {
    return { ...prevState, lastResult: submission.reply() };
  }

  const { siteKey, token } = await getRecaptchaFromForm(payload);
  const recaptchaValidation = assertRecaptchaTokenPresent(siteKey, token, t('recaptchaRequired'));

  if (!recaptchaValidation.success) {
    return {
      ...prevState,
      lastResult: submission.reply({ formErrors: recaptchaValidation.formErrors }),
    };
  }

  const { productEntityId, ...input } = submission.value;

  try {
    const response = await client.fetch({
      document: AddProductReviewMutation,
      customerAccessToken,
      fetchOptions: { cache: 'no-store' },
      variables: {
        input: {
          review: {
            ...input,
          },
          productEntityId,
        },
        reCaptchaV2:
          recaptchaValidation.token != null ? { token: recaptchaValidation.token } : undefined,
      },
    });

    const result = response.data.catalog.addProductReview;

    if (result.errors.length > 0) {
      return {
        ...prevState,
        lastResult: submission.reply({ formErrors: result.errors.map(({ message }) => message) }),
      };
    }

    return {
      ...prevState,
      lastResult: submission.reply(),
      successMessage: t('successMessage'),
    };
  } catch (error) {
    if (error instanceof BigCommerceGQLError) {
      return {
        ...prevState,
        lastResult: submission.reply({ formErrors: error.errors.map(({ message }) => message) }),
      };
    }

    if (error instanceof Error) {
      return {
        ...prevState,
        lastResult: submission.reply({ formErrors: [error.message] }),
      };
    }

    return {
      ...prevState,
      lastResult: submission.reply({ formErrors: [t('somethingWentWrong')] }),
    };
  }
}
