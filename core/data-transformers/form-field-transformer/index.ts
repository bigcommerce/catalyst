import { FragmentOf } from 'gql.tada';

import { Field } from '@/vibes/soul/form/dynamic-form/schema';

import { FormFieldsFragment } from './fragment';
import { FieldNameToFieldId } from './utils';

export const formFieldTransformer = (
  field: FragmentOf<typeof FormFieldsFragment> & { name?: string },
): Field | null => {
  // If the field name is provided, use it; otherwise, fallback to the entityId mapped name or label.
  const name = field.name ?? FieldNameToFieldId[Number(field.entityId)] ?? field.label;

  switch (field.__typename) {
    case 'CheckboxesFormField':
      return {
        id: String(field.entityId),
        type: 'checkbox-group',
        name,
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
        name,
        label: field.label,
        required: field.isRequired,
        minDate: field.minDate ?? undefined,
        maxDate: field.maxDate ?? undefined,
      };

    case 'MultilineTextFormField':
      return {
        id: String(field.entityId),
        type: 'textarea',
        name,
        label: field.label,
        required: field.isRequired,
      };

    case 'NumberFormField':
      return {
        id: String(field.entityId),
        type: 'number',
        name,
        label: field.label,
        required: field.isRequired,
      };

    case 'PasswordFormField':
      return {
        id: String(field.entityId),
        type:
          field.entityId === FieldNameToFieldId.confirmPassword ? 'confirm-password' : 'password',
        name,
        label: field.label,
        required: field.isRequired,
      };

    case 'PicklistFormField':
      if (field.entityId === FieldNameToFieldId.countryCode) {
        return {
          id: String(field.entityId),
          type: 'select',
          name,
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
        name,
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
        name,
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
        name,
        label: field.label,
        required: field.isRequired,
      };

    default:
      return null;
  }
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
