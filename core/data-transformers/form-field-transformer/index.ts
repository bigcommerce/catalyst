import { FragmentOf } from 'gql.tada';

import { Field } from '@/vibes/soul/form/dynamic-form/schema';

import { FormFieldsFragment } from './fragment';
import { FieldNameToFieldId } from './utils';

export const formFieldTransformer = (
  field: FragmentOf<typeof FormFieldsFragment>,
): Field | null => {
  switch (field.__typename) {
    case 'CheckboxesFormField':
      return {
        id: String(field.entityId),
        type: 'checkbox-group',
        name: String(field.entityId),
        label: field.label,
        required: field.isRequired,
        options: field.options.map((option) => ({
          label: option.label,
          value: String(option.entityId),
        })),
      };

    case 'DateFormField':
      return {
        id: String(field.entityId),
        type: 'date',
        name: String(field.entityId),
        label: field.label,
        required: field.isRequired,
        minDate: field.minDate ?? undefined,
        maxDate: field.maxDate ?? undefined,
      };

    case 'MultilineTextFormField':
      return {
        id: String(field.entityId),
        type: 'textarea',
        name: String(field.entityId),
        label: field.label,
        required: field.isRequired,
      };

    case 'NumberFormField':
      return {
        id: String(field.entityId),
        type: 'number',
        name: String(field.entityId),
        label: field.label,
        required: field.isRequired,
      };

    case 'PasswordFormField':
      return {
        id: String(field.entityId),
        type:
          field.entityId === FieldNameToFieldId.confirmPassword ? 'confirm-password' : 'password',
        name: String(field.entityId),
        label: field.label,
        required: field.isRequired,
      };

    case 'PicklistFormField':
      if (field.entityId === FieldNameToFieldId.countryCode) {
        return {
          id: String(field.entityId),
          type: 'select',
          name: String(field.entityId),
          label: field.label,
          required: field.isRequired,
          options: field.options.map((option) => ({
            label: option.label,
            value: String(option.entityId),
          })),
        };
      }

      return {
        id: String(field.entityId),
        type: 'button-radio-group',
        name: String(field.entityId),
        label: field.label,
        required: field.isRequired,
        options: field.options.map((option) => ({
          label: option.label,
          value: String(option.entityId),
        })),
      };

    case 'RadioButtonsFormField':
      return {
        id: String(field.entityId),
        type: 'radio-group',
        name: String(field.entityId),
        label: field.label,
        required: field.isRequired,
        options: field.options.map((option) => ({
          label: option.label,
          value: String(option.entityId),
        })),
      };

    case 'PicklistOrTextFormField':
    case 'TextFormField':
      return {
        id: String(field.entityId),
        type: field.entityId === FieldNameToFieldId.email ? 'email' : 'text',
        name: String(field.entityId),
        label: field.label,
        required: field.isRequired,
      };

    default:
      return null;
  }
};

// TODO: See if we can merge this is with the above function
// Will require testing and refactoring of register customer functionality
export const fieldToFieldNameTransformer = (field: Field): Field => {
  const name = FieldNameToFieldId[Number(field.name)];

  return {
    ...field,
    name: name ?? (field.label || field.name),
  };
};

export const injectCountryCodeOptions = (
  field: Field,
  countries: Array<{ code: string; name: string }>,
): Field => {
  if (field.type === 'select' && field.id === String(FieldNameToFieldId.countryCode)) {
    return {
      ...field,
      options: countries.map((country) => ({
        label: country.name,
        value: country.code,
      })),
    };
  }

  return field;
};
