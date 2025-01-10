'use server';

import { parseWithZod } from '@conform-to/zod';
import { getTranslations } from 'next-intl/server';

import { ChangePasswordAction } from '@/vibes/soul/sections/account-settings-section/change-password-form';
import { changePasswordSchema } from '@/vibes/soul/sections/account-settings-section/schema';
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
  const t = await getTranslations('Account.Settings.ChangePassword');
  const customerAccessToken = await getSessionCustomerAccessToken();

  const submission = parseWithZod(formData, { schema: changePasswordSchema });

  if (submission.status !== 'success') {
    return submission.reply();
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
      return submission.reply({ formErrors: result.errors.map((error) => error.message) });
    }

    return submission.reply();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    return submission.reply({ formErrors: [t('error')] });
  }
};
