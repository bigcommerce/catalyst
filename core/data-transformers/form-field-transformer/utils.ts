import { exists } from '~/lib/utils';

import { FormField, FormFieldValue } from './fragment';

/* This mapping needed for aligning built-in fields names to their ids
 for creating valid register customer request object
 that will be sent in mutation */
export enum FieldNameToFieldId {
  email = 1,
  password,
  confirmPassword,
  firstName,
  lastName,
  company,
  phone,
  address1,
  address2,
  city,
  countryCode,
  stateOrProvince,
  postalCode,
  currentPassword = 24,
  exclusiveOffers = 25,
}

export const CUSTOMER_FIELDS_TO_EXCLUDE = [FieldNameToFieldId.currentPassword];

export const REGISTER_CUSTOMER_FORM_LAYOUT = [
  [FieldNameToFieldId.firstName, FieldNameToFieldId.lastName],
  FieldNameToFieldId.email,
  FieldNameToFieldId.password,
  FieldNameToFieldId.confirmPassword,
  FieldNameToFieldId.company,
  FieldNameToFieldId.phone,
  FieldNameToFieldId.address1,
  FieldNameToFieldId.address2,
  [FieldNameToFieldId.city, FieldNameToFieldId.stateOrProvince],
  [FieldNameToFieldId.postalCode, FieldNameToFieldId.countryCode],
];

export const ADDRESS_FORM_LAYOUT = [
  [FieldNameToFieldId.firstName, FieldNameToFieldId.lastName],
  FieldNameToFieldId.company,
  FieldNameToFieldId.phone,
  FieldNameToFieldId.address1,
  FieldNameToFieldId.address2,
  [FieldNameToFieldId.city, FieldNameToFieldId.stateOrProvince],
  [FieldNameToFieldId.postalCode, FieldNameToFieldId.countryCode],
];

export const getPreviouslySubmittedValue = (fieldValue?: FormFieldValue) => {
  if (!fieldValue) {
    return {};
  }

  switch (fieldValue.__typename) {
    case 'TextFormFieldValue':
      return { TextFormField: fieldValue.text };

    case 'NumberFormFieldValue':
      return { NumberFormField: fieldValue.number };

    case 'MultilineTextFormFieldValue':
      return { MultilineTextFormField: fieldValue.multilineText };

    case 'DateFormFieldValue':
      return { DateFormField: fieldValue.date.utc };

    case 'MultipleChoiceFormFieldValue':
      return { MultipleChoiceFormField: fieldValue.valueEntityId.toString() };

    case 'CheckboxesFormFieldValue':
      return { CheckboxesFormField: fieldValue.valueEntityIds };

    case 'PasswordFormFieldValue':
      return { PasswordFormField: fieldValue.password };
  }
};

export const mapFormFieldValueToName = (field: FormFieldValue): Record<string, unknown> => {
  switch (field.__typename) {
    case 'CheckboxesFormFieldValue':
      return {
        [field.name]: field.valueEntityIds,
      };

    case 'DateFormFieldValue':
      return {
        [field.name]: field.date.utc,
      };

    case 'MultipleChoiceFormFieldValue':
      return {
        [field.name]: field.valueEntityId,
      };

    case 'NumberFormFieldValue':
      return {
        [field.name]: field.number,
      };

    case 'PasswordFormFieldValue':
      return {
        [field.name]: field.password,
      };

    case 'TextFormFieldValue':
      return {
        [field.name]: field.text,
      };

    case 'MultilineTextFormFieldValue':
      return {
        [field.name]: field.multilineText,
      };

    default:
      return {};
  }
};

export const transformFieldsToLayout = (
  fields: FormField[],
  layout: Array<FieldNameToFieldId | FieldNameToFieldId[]>,
): Array<FormField | FormField[]> => {
  const fieldMap = new Map(fields.map((field) => [field.entityId, field]));

  const presetLayout = layout
    .map((row) => {
      if (Array.isArray(row)) {
        return row.map((fieldId) => fieldMap.get(fieldId)).filter<FormField>(exists);
      }

      return fieldMap.get(row);
    })
    .filter<FormField | FormField[]>(exists);

  const usedFieldIds = new Set(layout.flatMap((row) => (Array.isArray(row) ? row : [row])));

  const remainingLayout: FormField[] = fields.filter((field) => !usedFieldIds.has(field.entityId));

  return [...presetLayout, ...remainingLayout];
};
