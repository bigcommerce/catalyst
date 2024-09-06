import { FragmentOf } from 'gql.tada';

import { Field, FieldControl, FieldLabel, Input, Select } from '~/components/ui/form';

import { FormFieldsFragment } from './fragment';

type PicklistOrTextType = Extract<
  FragmentOf<typeof FormFieldsFragment>,
  { __typename: 'PicklistOrTextFormField' }
>;

interface PicklistOrTextProps {
  defaultValue?: string;
  field: PicklistOrTextType;
  name: string;
  options: Array<{ label: string; entityId: string | number }>;
  variant?: 'error';
}

export const PicklistOrText = ({ defaultValue, field, name, options }: PicklistOrTextProps) => (
  <Field className="relative space-y-2 pb-7" name={name}>
    <FieldLabel
      className="font-semibold"
      htmlFor={`field-${field.entityId}`}
      isRequired={options.length !== 0 ? field.isRequired : false}
    >
      {field.label}
    </FieldLabel>
    <FieldControl asChild>
      {options.length === 0 ? (
        <Input id={`field-${field.entityId}`} type="text" />
      ) : (
        <Select
          defaultValue={defaultValue}
          id={`field-${field.entityId}`}
          key={defaultValue}
          options={options.map(({ entityId, label }) => ({
            label,
            value: entityId.toString(),
          }))}
          required={field.isRequired}
        />
      )}
    </FieldControl>
  </Field>
);
