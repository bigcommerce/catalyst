'use server';

import { BigCommerceGQLError } from '@bigcommerce/catalyst-client';
import { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { unstable_expireTag } from 'next/cache';
import { getTranslations } from 'next-intl/server';
import { z } from 'zod';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { TAGS } from '~/client/tags';

const updateNewsletterSubscriptionSchema = z.object({
  intent: z.enum(['subscribe', 'unsubscribe']),
});

const SubscribeToNewsletterMutation = graphql(`
  mutation SubscribeToNewsletterMutation($input: CreateSubscriberInput!) {
    newsletter {
      subscribe(input: $input) {
        errors {
          __typename
          ... on CreateSubscriberAlreadyExistsError {
            message
          }
          ... on CreateSubscriberEmailInvalidError {
            message
          }
          ... on CreateSubscriberUnexpectedError {
            message
          }
          ... on CreateSubscriberLastNameInvalidError {
            message
          }
          ... on CreateSubscriberFirstNameInvalidError {
            message
          }
        }
      }
    }
  }
`);

const UnsubscribeFromNewsletterMutation = graphql(`
  mutation UnsubscribeFromNewsletterMutation($input: RemoveSubscriberInput!) {
    newsletter {
      unsubscribe(input: $input) {
        errors {
          __typename
          ... on RemoveSubscriberEmailInvalidError {
            message
          }
          ... on RemoveSubscriberUnexpectedError {
            message
          }
        }
      }
    }
  }
`);

export const updateNewsletterSubscription = async (
  {
    customerInfo,
  }: {
    customerInfo: {
      email: string;
      firstName: string;
      lastName: string;
    };
  },
  _prevState: { lastResult: SubmissionResult | null },
  formData: FormData,
) => {
  const t = await getTranslations('Account.Settings.NewsletterSubscription');

  const submission = parseWithZod(formData, { schema: updateNewsletterSubscriptionSchema });

  if (submission.status !== 'success') {
    return { lastResult: submission.reply() };
  }

  try {
    let errors;

    if (submission.value.intent === 'subscribe') {
      const response = await client.fetch({
        document: SubscribeToNewsletterMutation,
        variables: {
          input: {
            email: customerInfo.email,
            firstName: customerInfo.firstName,
            lastName: customerInfo.lastName,
          },
        },
      });

      errors = response.data.newsletter.subscribe.errors;
    } else {
      const response = await client.fetch({
        document: UnsubscribeFromNewsletterMutation,
        variables: {
          input: {
            email: customerInfo.email,
          },
        },
      });

      errors = response.data.newsletter.unsubscribe.errors;
    }

    if (errors.length > 0) {
      // Not handling returned errors from API since we will display a generic error message to the user
      // Still returning the errors to the client for debugging purposes
      return {
        lastResult: submission.reply({
          formErrors: errors.map(({ message }) => message),
        }),
      };
    }

    unstable_expireTag(TAGS.customer);

    return {
      lastResult: submission.reply(),
      successMessage: t('marketingPreferencesUpdated'),
    };
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
      return {
        lastResult: submission.reply({ formErrors: [error.message] }),
      };
    }

    return {
      lastResult: submission.reply({ formErrors: [String(error)] }),
    };
  }
};
