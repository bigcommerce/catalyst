import { AddressOrAccountFormField } from '..';

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

export enum FieldTypeToFieldInput {
  'CheckboxesFormField' = 'checkboxes',
  'DateFormField' = 'dates',
  'NumberFormField' = 'numbers',
  'PasswordFormField' = 'passwords',
  'TextFormField' = 'texts',
  'RadioButtonsFormField' = 'multipleChoices',
  'MultilineTextFormField' = 'multilineTexts',
}

export const CUSTOMER_FIELDS_TO_EXCLUDE = [
  FieldNameToFieldId.currentPassword,
  FieldNameToFieldId.exclusiveOffers,
];

export const BOTH_CUSTOMER_ADDRESS_FIELDS = [
  FieldNameToFieldId.firstName,
  FieldNameToFieldId.lastName,
  FieldNameToFieldId.company,
  FieldNameToFieldId.phone,
];

export const createFieldName = (
  field: AddressOrAccountFormField,
  fieldOrigin: 'customer' | 'address',
) => {
  const { isBuiltIn, entityId: fieldId, __typename: fieldType } = field;
  const isCustomField = !isBuiltIn;
  let secondFieldType = fieldOrigin;

  if (isCustomField && fieldType !== 'PicklistOrTextFormField') {
    const customFieldInputType =
      fieldType === 'PicklistFormField' ? 'multipleChoices' : FieldTypeToFieldInput[fieldType];

    return `custom_${customFieldInputType}-${fieldId}`;
  }

  if (fieldOrigin === 'address') {
    secondFieldType = 'customer';
  }

  if (fieldOrigin === 'customer') {
    secondFieldType = 'address';
  }

  return `${fieldOrigin}-${BOTH_CUSTOMER_ADDRESS_FIELDS.includes(fieldId) ? `${secondFieldType}-` : ''}${FieldNameToFieldId[fieldId] || fieldId}`;
};
