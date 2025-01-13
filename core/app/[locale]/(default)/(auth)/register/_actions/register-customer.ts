'use server';

import { BigCommerceAPIError } from '@bigcommerce/catalyst-client';
import { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { getLocale, getTranslations } from 'next-intl/server';
import { z } from 'zod';

import { Field, FieldGroup, schema } from '@/vibes/soul/primitives/dynamic-form/schema';
import { signIn } from '~/auth';
import { client } from '~/client';
import { graphql, VariablesOf } from '~/client/graphql';
import { FieldNameToFieldId } from '~/data-transformers/form-field-transformer/utils';
import { redirect } from '~/i18n/routing';

const RegisterCustomerMutation = graphql(`
  mutation RegisterCustomer($input: RegisterCustomerInput!, $reCaptchaV2: ReCaptchaV2Input) {
    customer {
      registerCustomer(input: $input, reCaptchaV2: $reCaptchaV2) {
        customer {
          firstName
          lastName
        }
        errors {
          ... on EmailAlreadyInUseError {
            message
          }
          ... on AccountCreationDisabledError {
            message
          }
          ... on CustomerRegistrationError {
            message
          }
          ... on ValidationError {
            message
          }
        }
      }
    }
  }
`);

const stringToNumber = z.string().pipe(z.coerce.number());

const inputSchema = z.object({
  email: z.string(),
  password: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  formFields: z.object({
    checkboxes: z.array(
      z.object({
        fieldEntityId: stringToNumber,
        fieldValueEntityIds: z.array(stringToNumber),
      }),
    ),
    multipleChoices: z.array(
      z.object({
        fieldEntityId: stringToNumber,
        fieldValueEntityId: stringToNumber,
      }),
    ),
    numbers: z.array(
      z.object({
        fieldEntityId: stringToNumber,
        number: stringToNumber,
      }),
    ),
    dates: z.array(
      z.object({
        fieldEntityId: stringToNumber,
        date: z.string(),
      }),
    ),
    passwords: z.array(
      z.object({
        fieldEntityId: stringToNumber,
        password: z.string(),
      }),
    ),
    multilineTexts: z.array(
      z.object({
        fieldEntityId: stringToNumber,
        multilineText: z.string(),
      }),
    ),
    texts: z.array(
      z.object({
        fieldEntityId: stringToNumber,
        text: z.string(),
      }),
    ),
  }),
});

function parseRegisterCustomerInput(
  value: Record<string, string | number | string[] | undefined>,
  fields: Array<Field | FieldGroup<Field>>,
): VariablesOf<typeof RegisterCustomerMutation>['input'] {
  const customFields = fields
    .flatMap((f) => (Array.isArray(f) ? f : [f]))
    .filter(
      (field) =>
        ![
          String(FieldNameToFieldId.email),
          String(FieldNameToFieldId.password),
          String(FieldNameToFieldId.confirmPassword),
          String(FieldNameToFieldId.firstName),
          String(FieldNameToFieldId.lastName),
        ].includes(field.name),
    );
  const mappedInput = {
    email: value[FieldNameToFieldId.email],
    password: value[FieldNameToFieldId.password],
    firstName: value[FieldNameToFieldId.firstName],
    lastName: value[FieldNameToFieldId.lastName],
    formFields: {
      checkboxes: customFields
        .filter((field) => ['checkbox-group'].includes(field.type))
        .filter((field) => Boolean(value[field.name]))
        .map((field) => {
          return {
            fieldEntityId: field.name,
            fieldValueEntityIds: value[field.name],
          };
        }),
      multipleChoices: customFields
        .filter((field) => ['radio-group', 'button-radio-group'].includes(field.type))
        .filter((field) => Boolean(value[field.name]))
        .map((field) => {
          return {
            fieldEntityId: field.name,
            fieldValueEntityId: value[field.name],
          };
        }),
      numbers: customFields
        .filter((field) => ['number'].includes(field.type))
        .filter((field) => Boolean(value[field.name]))
        .map((field) => {
          return {
            fieldEntityId: field.name,
            number: value[field.name],
          };
        }),
      dates: customFields
        .filter((field) => ['date'].includes(field.type))
        .filter((field) => Boolean(value[field.name]))
        .map((field) => {
          return {
            fieldEntityId: field.name,
            date: new Date(String(value[field.name])).toISOString(),
          };
        }),
      passwords: customFields
        .filter((field) => ['password'].includes(field.type))
        .filter((field) => Boolean(value[field.name]))
        .map((field) => ({
          fieldEntityId: field.name,
          password: value[field.name],
        })),
      multilineTexts: customFields
        .filter((field) => ['textarea'].includes(field.type))
        .filter((field) => Boolean(value[field.name]))
        .map((field) => ({
          fieldEntityId: field.name,
          multilineText: value[field.name],
        })),
      texts: customFields
        .filter((field) => ['text'].includes(field.type))
        .filter((field) => Boolean(value[field.name]))
        .map((field) => ({
          fieldEntityId: field.name,
          text: value[field.name],
        })),
    },
  };

  return inputSchema.parse(mappedInput);
}

export async function registerCustomer<F extends Field>(
  prevState: { lastResult: SubmissionResult | null; fields: Array<F | FieldGroup<F>> },
  formData: FormData,
) {
  const t = await getTranslations('Register');
  const locale = await getLocale();

  const submission = parseWithZod(formData, { schema: schema(prevState.fields) });

  if (submission.status !== 'success') {
    return {
      lastResult: submission.reply(),
      fields: prevState.fields,
    };
  }

  try {
    const input = parseRegisterCustomerInput(submission.value, prevState.fields);
    const response = await client.fetch({
      document: RegisterCustomerMutation,
      variables: {
        input,
        // ...(recaptchaToken && { reCaptchaV2: { token: recaptchaToken } }),
      },
      fetchOptions: { cache: 'no-store' },
    });

    const result = response.data.customer.registerCustomer;

    if (result.errors.length > 0) {
      return {
        lastResult: submission.reply({ formErrors: result.errors.map((error) => error.message) }),
        fields: prevState.fields,
      };
    }

    await signIn(
      {
        type: 'password',
        email: input.email,
        password: input.password,
      },
      {
        // We want to use next/navigation for the redirect as it
        // follows basePath and trailing slash configurations.
        redirect: false,
      },
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    if (error instanceof BigCommerceAPIError) {
      return {
        lastResult: submission.reply({ formErrors: [t('Errors.apiError')] }),
        fields: prevState.fields,
      };
    }

    return {
      lastResult: submission.reply({ formErrors: [t('Errors.error')] }),
      fields: prevState.fields,
    };
  }

  return redirect({ href: '/account/orders', locale });
}
