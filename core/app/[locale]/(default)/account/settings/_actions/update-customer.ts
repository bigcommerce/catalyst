'use server';

import { BigCommerceGQLError } from '@bigcommerce/catalyst-client';
import { parseWithZod } from '@conform-to/zod';
import { revalidateTag } from 'next/cache';
import { getTranslations } from 'next-intl/server';

import { Field, FieldGroup } from '@/vibes/soul/form/dynamic-form/schema';
import { updateAccountSchema } from '@/vibes/soul/sections/account-settings/schema';
import { State } from '@/vibes/soul/sections/account-settings/update-account-form';
import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql, VariablesOf } from '~/client/graphql';
import { TAGS } from '~/client/tags';

const UpdateCustomerMutation = graphql(`
  mutation UpdateCustomerMutation($input: UpdateCustomerInput!) {
    customer {
      updateCustomer(input: $input) {
        customer {
          firstName
          lastName
          email
          company
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

type FormFieldsInput = NonNullable<
  VariablesOf<typeof UpdateCustomerMutation>['input']['formFields']
>;

/*
 * BigCommerce re-validates every required custom customer field on every updateCustomer call,
 * even ones already satisfied by a prior save (see issue #3074) - so any required custom field
 * rendered in the form must always be resent here, not just the ones the user actually changed.
 */
function buildFormFieldsInput(
  fields: Array<Field | FieldGroup<Field>>,
  value: Record<string, unknown>,
): FormFieldsInput {
  const flatFields = fields.flatMap((field) => (Array.isArray(field) ? field : [field]));

  return {
    checkboxes: flatFields
      .filter((field) => field.type === 'checkbox-group')
      .filter((field) => Boolean(value[field.name]))
      .map((field) => {
        const rawValue = value[field.name];
        const rawValues = Array.isArray(rawValue) ? rawValue : [rawValue];

        return {
          fieldEntityId: Number(field.id),
          fieldValueEntityIds: rawValues.map(Number),
        };
      }),
    multipleChoices: flatFields
      .filter((field) => ['radio-group', 'button-radio-group', 'select'].includes(field.type))
      .filter((field) => Boolean(value[field.name]))
      .map((field) => ({
        fieldEntityId: Number(field.id),
        fieldValueEntityId: Number(value[field.name]),
      })),
    numbers: flatFields
      .filter((field) => field.type === 'number')
      .filter((field) => Boolean(value[field.name]))
      .map((field) => ({
        fieldEntityId: Number(field.id),
        number: Number(value[field.name]),
      })),
    dates: flatFields
      .filter((field) => field.type === 'date')
      .filter((field) => Boolean(value[field.name]))
      .map((field) => ({
        fieldEntityId: Number(field.id),
        date: new Date(String(value[field.name])).toISOString(),
      })),
    multilineTexts: flatFields
      .filter((field) => field.type === 'textarea')
      .filter((field) => Boolean(value[field.name]))
      .map((field) => ({
        fieldEntityId: Number(field.id),
        multilineText: String(value[field.name]),
      })),
    texts: flatFields
      .filter((field) => field.type === 'text' || field.type === 'email')
      .filter((field) => Boolean(value[field.name]))
      .map((field) => ({
        fieldEntityId: Number(field.id),
        text: String(value[field.name]),
      })),
  };
}

export async function updateCustomer(
  { fields }: { fields: Array<Field | FieldGroup<Field>> },
  prevState: Awaited<State>,
  formData: FormData,
): Promise<State> {
  const t = await getTranslations('Account.Settings');
  const customerAccessToken = await getSessionCustomerAccessToken();

  const submission = parseWithZod(formData, { schema: updateAccountSchema(fields) });

  if (submission.status !== 'success') {
    return {
      account: prevState.account,
      lastResult: submission.reply(),
    };
  }

  const { firstName, lastName, email, company, ...customFieldValues } = submission.value;

  try {
    const response = await client.fetch({
      document: UpdateCustomerMutation,
      customerAccessToken,
      variables: {
        input: {
          firstName,
          lastName,
          email,
          company,
          formFields: buildFormFieldsInput(fields, customFieldValues),
        },
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

    revalidateTag(TAGS.customer, { expire: 0 });

    return {
      account: submission.value,
      successMessage: t('settingsUpdated'),
      lastResult: submission.reply(),
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    if (error instanceof BigCommerceGQLError) {
      return {
        account: prevState.account,
        lastResult: submission.reply({
          formErrors: error.errors.map(({ message }) => message),
        }),
      };
    }

    if (error instanceof Error) {
      return {
        account: prevState.account,
        lastResult: submission.reply({ formErrors: [error.message] }),
      };
    }

    return {
      account: prevState.account,
      lastResult: submission.reply({ formErrors: [t('somethingWentWrong')] }),
    };
  }
}
