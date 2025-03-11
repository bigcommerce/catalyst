import { BigCommerceGQLError } from '@bigcommerce/catalyst-client';
import { parseWithZod } from '@conform-to/zod';
import { unstable_expireTag as expireTag } from 'next/cache';
import { getTranslations } from 'next-intl/server';
import { z } from 'zod';

import { Field, FieldGroup } from '@/vibes/soul/primitives/dynamic-form/schema';
import { schema } from '@/vibes/soul/sections/address-list-section/schema';
import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql, VariablesOf } from '~/client/graphql';
import { TAGS } from '~/client/tags';
import { FieldNameToFieldId } from '~/data-transformers/form-field-transformer/utils';

import { type State } from './address-action';

export const UpdateCustomerAddressMutation = graphql(`
  mutation UpdateCustomerAddressMutation($input: UpdateCustomerAddressInput!) {
    customer {
      updateCustomerAddress(input: $input) {
        errors {
          __typename
          ... on AddressDoesNotExistError {
            message
          }
          ... on CustomerAddressUpdateError {
            message
          }
          ... on CustomerNotLoggedInError {
            message
          }
          ... on ValidationError {
            message
            path
          }
        }
        address {
          entityId
        }
      }
    }
  }
`);

const stringToNumber = z.coerce.string().pipe(z.coerce.number());

const inputSchema = z.object({
  addressEntityId: stringToNumber,
  data: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    address1: z.string().optional(),
    address2: z.string().optional(),
    city: z.string().optional(),
    company: z.string().optional(),
    countryCode: z.string().optional(),
    stateOrProvince: z.string().optional(),
    phone: z.string().optional(),
    postalCode: z.string().optional(),
    formFields: z
      .object({
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
      })
      .optional(),
  }),
});

function parseUpdateAddressInput(
  value: Record<string, unknown>,
  fields: Array<Field | FieldGroup<Field>>,
): VariablesOf<typeof UpdateCustomerAddressMutation>['input'] {
  const customFields = fields
    .flatMap((f) => (Array.isArray(f) ? f : [f]))
    .filter((field) => Boolean(value[field.name]))
    .filter(
      (field) =>
        field.id &&
        ![
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
        ].includes(field.id),
    );
  const mappedInput = {
    addressEntityId: value.id,
    data: {
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
        checkboxes: customFields
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
        multipleChoices: customFields
          .filter((field) => ['radio-group', 'button-radio-group'].includes(field.type))
          .filter((field) => Boolean(value[field.name]))
          .map((field) => {
            return {
              fieldEntityId: field.id,
              fieldValueEntityId: value[field.name],
            };
          }),
        numbers: customFields
          .filter((field) => ['number'].includes(field.type))
          .filter((field) => Boolean(value[field.name]))
          .map((field) => {
            return {
              fieldEntityId: field.id,
              number: value[field.name],
            };
          }),
        dates: customFields
          .filter((field) => ['date'].includes(field.type))
          .filter((field) => Boolean(value[field.name]))
          .map((field) => {
            return {
              fieldEntityId: field.id,
              date: new Date(String(value[field.name])).toISOString(),
            };
          }),
        passwords: customFields
          .filter((field) => ['password'].includes(field.type))
          .filter((field) => Boolean(value[field.name]))
          .map((field) => ({
            fieldEntityId: field.id,
            password: value[field.name],
          })),
        multilineTexts: customFields
          .filter((field) => ['textarea'].includes(field.type))
          .filter((field) => Boolean(value[field.name]))
          .map((field) => ({
            fieldEntityId: field.id,
            multilineText: value[field.name],
          })),
        texts: customFields
          .filter((field) => ['text'].includes(field.type))
          .filter((field) => Boolean(value[field.name]))
          .map((field) => ({
            fieldEntityId: field.id,
            text: value[field.name],
          })),
      },
    },
  };

  return inputSchema.parse(mappedInput);
}

export async function updateAddress(prevState: Awaited<State>, formData: FormData): Promise<State> {
  const t = await getTranslations('Account.Addresses');
  const customerAccessToken = await getSessionCustomerAccessToken();

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== 'success') {
    return {
      ...prevState,
      lastResult: submission.reply(),
    };
  }

  try {
    const input = parseUpdateAddressInput(submission.value, prevState.fields);

    const response = await client.fetch({
      document: UpdateCustomerAddressMutation,
      customerAccessToken,
      fetchOptions: { cache: 'no-store' },
      variables: {
        input,
      },
    });

    const result = response.data.customer.updateCustomerAddress;

    if (result.errors.length > 0) {
      return {
        ...prevState,
        lastResult: submission.reply({ formErrors: result.errors.map((error) => error.message) }),
      };
    }

    expireTag(TAGS.customer);

    return {
      addresses: prevState.addresses.map((address) =>
        address.id === submission.value.id ? submission.value : address,
      ),
      lastResult: submission.reply({ resetForm: true }),
      defaultAddress: prevState.defaultAddress,
      fields: prevState.fields,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    if (error instanceof BigCommerceGQLError) {
      return {
        ...prevState,
        lastResult: submission.reply({
          formErrors: error.errors.map(({ message }) => message),
        }),
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
      lastResult: submission.reply({ formErrors: [t('Errors.error')] }),
    };
  }
}
