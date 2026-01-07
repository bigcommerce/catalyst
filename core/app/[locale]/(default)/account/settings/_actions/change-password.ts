'use server';

import { BigCommerceGQLError } from '@bigcommerce/catalyst-client';
import { parseWithZod } from '@conform-to/zod';
import { unstable_rethrow } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { ChangePasswordAction } from '@/vibes/soul/sections/account-settings/change-password-form';
import { changePasswordSchema } from '@/vibes/soul/sections/account-settings/schema';
import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';

const CustomerChangePasswordMutation = graphql(`
  mutation CustomerChangePasswordMutation($input: ChangePasswordInput!) {
    customer {
      changePassword(input: $input) {
        errors {
          ... on ValidationError {
            message
            path
          }
          ... on CustomerDoesNotExistError {
            message
          }
          ... on CustomerPasswordError {
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

export const changePassword: ChangePasswordAction = async (prevState, formData) => {
  const t = await getTranslations('Account.Settings');
  const customerAccessToken = await getSessionCustomerAccessToken();

  const submission = parseWithZod(formData, { schema: changePasswordSchema });

  if (submission.status !== 'success') {
    return { lastResult: submission.reply() };
  }

  const input = {
    currentPassword: submission.value.currentPassword,
    newPassword: submission.value.password,
  };

  try {
    const response = await client.fetch({
      document: CustomerChangePasswordMutation,
      variables: {
        input,
      },
      customerAccessToken,
    });

    const result = response.data.customer.changePassword;

    if (result.errors.length > 0) {
      return {
        lastResult: submission.reply({ formErrors: result.errors.map((error) => error.message) }),
      };
    }

    return {
      lastResult: submission.reply(),
      successMessage: t('passwordUpdated'),
    };
  } catch (error) {
    unstable_rethrow(error);

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

    return { lastResult: submission.reply({ formErrors: [t('somethingWentWrong')] }) };
  }
};
