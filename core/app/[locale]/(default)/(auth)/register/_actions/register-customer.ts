'use server';

import { BigCommerceGQLError } from '@bigcommerce/catalyst-client';
import { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { getLocale, getTranslations } from 'next-intl/server';
import { z } from 'zod';

import { Field, FieldGroup, schema } from '@/vibes/soul/form/dynamic-form/schema';
import { signIn } from '~/auth';
import { client } from '~/client';
import { graphql, VariablesOf } from '~/client/graphql';
import { FieldNameToFieldId } from '~/data-transformers/form-field-transformer/utils';
import { redirect } from '~/i18n/routing';
import { getCartId } from '~/lib/cart';

import { ADDRESS_FIELDS_NAME_PREFIX, CUSTOMER_FIELDS_NAME_PREFIX } from './prefixes';

const RegisterCustomerMutation = graphql(`
  mutation RegisterCustomerMutation(
    $input: RegisterCustomerInput!
    $reCaptchaV2: ReCaptchaV2Input
  ) {
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
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  password: z.string(),
  phone: z.string().optional(),
  company: z.string().optional(),
  address: z
    .object({
      firstName: z.string(),
      lastName: z.string(),
      address1: z.string(),
      address2: z.string().optional(),
      city: z.string(),
      company: z.string().optional(),
      countryCode: z.string(),
      stateOrProvince: z.string().optional(),
      phone: z.string().optional(),
      postalCode: z.string().optional(),
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
    })
    .optional(),
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
          String(FieldNameToFieldId.address1),
          String(FieldNameToFieldId.address2),
          String(FieldNameToFieldId.city),
          String(FieldNameToFieldId.company),
          String(FieldNameToFieldId.countryCode),
          String(FieldNameToFieldId.stateOrProvince),
          String(FieldNameToFieldId.phone),
          String(FieldNameToFieldId.postalCode),
        ].includes(field.name),
    );

  const customAddressFields = customFields.filter((field) =>
    field.name.startsWith(ADDRESS_FIELDS_NAME_PREFIX),
  );
  const customCustomerFields = customFields.filter((field) =>
    field.name.startsWith(CUSTOMER_FIELDS_NAME_PREFIX),
  );

  const mappedInput = {
    firstName: value.firstName,
    lastName: value.lastName,
    email: value.email,
    password: value.password,
    phone: value.phone,
    company: value.company,
    address: {
      firstName: value.firstName,
      lastName: value.lastName,
      address1: value.address1,
      address2: value.address2,
      city: value.city,
      company: value.company,
      countryCode: value.countryCode,
      stateOrProvince: value.stateOrProvince,
      phone: value.phone,
      postalCode: value.postalCode,
      formFields: {
        checkboxes: customAddressFields
          .filter((field) => ['checkbox-group'].includes(field.type))
          .filter((field) => Boolean(value[field.name]))
          .map((field) => {
            return {
              fieldEntityId: field.id,
              fieldValueEntityIds: Array.isArray(value[field.name])
                ? value[field.name]
                : [value[field.name]],
            };
          }),
        multipleChoices: customAddressFields
          .filter((field) => ['radio-group', 'button-radio-group'].includes(field.type))
          .filter((field) => Boolean(value[field.name]))
          .map((field) => {
            return {
              fieldEntityId: field.id,
              fieldValueEntityId: value[field.name],
            };
          }),
        numbers: customAddressFields
          .filter((field) => ['number'].includes(field.type))
          .filter((field) => Boolean(value[field.name]))
          .map((field) => {
            return {
              fieldEntityId: field.id,
              number: value[field.name],
            };
          }),
        dates: customAddressFields
          .filter((field) => ['date'].includes(field.type))
          .filter((field) => Boolean(value[field.name]))
          .map((field) => {
            return {
              fieldEntityId: field.id,
              date: new Date(String(value[field.name])).toISOString(),
            };
          }),
        passwords: customAddressFields
          .filter((field) => ['password'].includes(field.type))
          .filter((field) => Boolean(value[field.name]))
          .map((field) => ({
            fieldEntityId: field.id,
            password: value[field.name],
          })),
        multilineTexts: customAddressFields
          .filter((field) => ['textarea'].includes(field.type))
          .filter((field) => Boolean(value[field.name]))
          .map((field) => ({
            fieldEntityId: field.id,
            multilineText: value[field.name],
          })),
        texts: customAddressFields
          .filter((field) => ['text'].includes(field.type))
          .filter((field) => Boolean(value[field.name]))
          .map((field) => ({
            fieldEntityId: field.id,
            text: value[field.name],
          })),
      },
    },
    formFields: {
      checkboxes: customCustomerFields
        .filter((field) => ['checkbox-group'].includes(field.type))
        .filter((field) => Boolean(value[field.name]))
        .map((field) => {
          return {
            fieldEntityId: field.id,
            fieldValueEntityIds: Array.isArray(value[field.name])
              ? value[field.name]
              : [value[field.name]],
          };
        }),
      multipleChoices: customCustomerFields
        .filter((field) => ['radio-group', 'button-radio-group'].includes(field.type))
        .filter((field) => Boolean(value[field.name]))
        .map((field) => {
          return {
            fieldEntityId: field.id,
            fieldValueEntityId: value[field.name],
          };
        }),
      numbers: customCustomerFields
        .filter((field) => ['number'].includes(field.type))
        .filter((field) => Boolean(value[field.name]))
        .map((field) => {
          return {
            fieldEntityId: field.id,
            number: value[field.name],
          };
        }),
      dates: customCustomerFields
        .filter((field) => ['date'].includes(field.type))
        .filter((field) => Boolean(value[field.name]))
        .map((field) => {
          return {
            fieldEntityId: field.id,
            date: new Date(String(value[field.name])).toISOString(),
          };
        }),
      passwords: customCustomerFields
        .filter((field) => ['password'].includes(field.type))
        .filter((field) => Boolean(value[field.name]))
        .map((field) => ({
          fieldEntityId: field.id,
          password: value[field.name],
        })),
      multilineTexts: customCustomerFields
        .filter((field) => ['textarea'].includes(field.type))
        .filter((field) => Boolean(value[field.name]))
        .map((field) => ({
          fieldEntityId: field.id,
          multilineText: value[field.name],
        })),
      texts: customCustomerFields
        .filter((field) => ['text'].includes(field.type))
        .filter((field) => Boolean(value[field.name]))
        .map((field) => ({
          fieldEntityId: field.id,
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
  const t = await getTranslations('Auth.Register');
  const locale = await getLocale();
  const cartId = await getCartId();

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
        lastResult: submission.reply({
          formErrors: response.data.customer.registerCustomer.errors.map((error) => error.message),
        }),
        fields: prevState.fields,
      };
    }

    await signIn('password', {
      email: input.email,
      password: input.password,
      cartId,
      // We want to use next/navigation for the redirect as it
      // follows basePath and trailing slash configurations.
      redirect: false,
    });
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

  return redirect({ href: '/account/orders', locale });
}
