'use server';

import { BigCommerceGQLError } from '@bigcommerce/catalyst-client';
import { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { getTranslations } from 'next-intl/server';

import { schema } from '@/vibes/soul/primitives/inline-email-form/schema';
import { client } from '~/client';
import { graphql } from '~/client/graphql';

const SubscribeToNewsletterMutation = graphql(`
  mutation SubscribeToNewsletterMutation($input: CreateSubscriberInput!) {
    newsletter {
      subscribe(input: $input) {
        errors {
          __typename
          ... on CreateSubscriberEmailInvalidError {
            message
          }
          ... on CreateSubscriberAlreadyExistsError {
            message
          }
          ... on CreateSubscriberUnexpectedError {
            message
          }
        }
      }
    }
  }
`);

export const subscribe = async (
  _lastResult: { lastResult: SubmissionResult | null },
  formData: FormData,
) => {
  const t = await getTranslations('Components.Subscribe');

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== 'success') {
    return { lastResult: submission.reply() };
  }

  try {
    const response = await client.fetch({
      document: SubscribeToNewsletterMutation,
      variables: {
        input: {
          email: submission.value.email,
        },
      },
      fetchOptions: {
        cache: 'no-store',
      },
    });

    const errors = response.data.newsletter.subscribe.errors;

    const subcriberAlreadyExists = errors.some(
      ({ __typename }) => __typename === 'CreateSubscriberAlreadyExistsError',
    );

    // If there are no errors or the subscriber already exists, we want to reset the form and show the success message
    // This is for privacy reasons, we don't want to show the error message to the user if they are already subscribed
    if (!errors.length || subcriberAlreadyExists) {
      return {
        lastResult: submission.reply(),
        successMessage: t('subscribedToNewsletter'),
      };
    }

    if (errors.length > 0) {
      // If there are other errors, we want to show the error message to the user
      return {
        lastResult: submission.reply({
          formErrors: errors.map(({ __typename }) => {
            switch (__typename) {
              case 'CreateSubscriberEmailInvalidError':
                return t('Errors.invalidEmail');

              default:
                return t('Errors.somethingWentWrong');
            }
          }),
        }),
      };
    }

    return { lastResult: submission.reply({ formErrors: [t('Errors.somethingWentWrong')] }) };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    if (error instanceof BigCommerceGQLError) {
      return {
        lastResult: submission.reply({
          formErrors: error.errors.map(({ message }) => message),
        }),
      };
    }

    if (error instanceof Error) {
      return { lastResult: submission.reply({ formErrors: [error.message] }) };
    }

    return { lastResult: submission.reply({ formErrors: [t('Errors.somethingWentWrong')] }) };
  }
};
