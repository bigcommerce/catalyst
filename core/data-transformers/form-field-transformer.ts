import { FragmentOf } from 'gql.tada';

import { Field } from '@/vibes/soul/primitives/dynamic-form/schema';
import { FieldNameToFieldId } from '~/components/form-fields';
import { FormFieldsFragment } from '~/components/form-fields/fragment';

export const formFieldTransformer = (
  field: FragmentOf<typeof FormFieldsFragment>,
): Field | null => {
  switch (field.__typename) {
    case 'CheckboxesFormField':
      return {
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
        type: 'date',
        name: String(field.entityId),
        label: field.label,
        required: field.isRequired,
        minDate: field.minDate ?? undefined,
        maxDate: field.maxDate ?? undefined,
      };

    case 'MultilineTextFormField':
      return {
        type: 'textarea',
        name: String(field.entityId),
        label: field.label,
        required: field.isRequired,
      };

    case 'NumberFormField':
      return {
        type: 'number',
        name: String(field.entityId),
        label: field.label,
        required: field.isRequired,
      };

    case 'PasswordFormField':
      return {
        type:
          field.entityId === FieldNameToFieldId.confirmPassword ? 'confirm-password' : 'password',
        name: String(field.entityId),
        label: field.label,
        required: field.isRequired,
      };

    case 'PicklistFormField':
      return {
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
        type: 'radio-group',
        name: String(field.entityId),
        label: field.label,
        required: field.isRequired,
        options: field.options.map((option) => ({
          label: option.label,
          value: String(option.entityId),
        })),
      };

    case 'TextFormField':
      return {
        type: field.entityId === FieldNameToFieldId.email ? 'email' : 'text',
        name: String(field.entityId),
        label: field.label,
        required: field.isRequired,
      };

    default:
      return null;
  }
};
