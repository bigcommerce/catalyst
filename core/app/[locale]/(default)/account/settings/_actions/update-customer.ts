'use server';

import { BigCommerceAPIError } from '@bigcommerce/catalyst-client';
import { parseWithZod } from '@conform-to/zod';
import { unstable_expireTag } from 'next/cache';
import { getTranslations } from 'next-intl/server';

import { updateAccountSchema } from '@/vibes/soul/sections/account-settings-section/schema';
import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { TAGS } from '~/client/tags';

import { UpdateAccountAction } from '../../../../../../vibes/soul/sections/account-settings-section/update-account-form';

const UpdateCustomerMutation = graphql(`
  mutation UpdateCustomerMutation($input: UpdateCustomerInput!) {
    customer {
      updateCustomer(input: $input) {
        customer {
          firstName
          lastName
        }
        errors {
          __typename
          ... on UnexpectedUpdateCustomerError {
            message
          }
          ... on EmailAlreadyInUseError {
            message
          }
          ... on ValidationError {
            message
          }
          ... on CustomerDoesNotExistError {
            message
          }
          ... on CustomerNotLoggedInError {
            message
          }
        }
      }
    }
  }
`);

export const updateCustomer: UpdateAccountAction = async (prevState, formData) => {
  const t = await getTranslations('Register');
  const customerAccessToken = await getSessionCustomerAccessToken();

  const submission = parseWithZod(formData, { schema: updateAccountSchema });

  if (submission.status !== 'success') {
    return {
      account: prevState.account,
      lastResult: submission.reply(),
    };
  }

  try {
    const response = await client.fetch({
      document: UpdateCustomerMutation,
      customerAccessToken,
      variables: {
        input: submission.value,
      },
      fetchOptions: { cache: 'no-store' },
    });

    const result = response.data.customer.updateCustomer;

    if (result.errors.length > 0) {
      return {
        account: prevState.account,
        lastResult: submission.reply({ formErrors: result.errors.map((error) => error.message) }),
      };
    }

    unstable_expireTag(TAGS.customer);

    return {
      account: submission.value,
      successMessage: t('successfulUpdate'),
      lastResult: submission.reply(),
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    if (error instanceof BigCommerceAPIError) {
      return {
        account: prevState.account,
        lastResult: submission.reply({ formErrors: [t('Errors.apiError')] }),
      };
    }

    return {
      account: prevState.account,
      lastResult: submission.reply({ formErrors: [t('Errors.error')] }),
    };
  }
};
