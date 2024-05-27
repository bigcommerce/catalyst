import { Field, FieldControl, FieldLabel } from '~/components/ui/form';
import { Select, SelectContent, SelectItem } from '~/components/ui/select';

import { AddressFields } from '..';

import { FieldNameToFieldId } from './utils';

type PicklistType = Extract<
  NonNullable<AddressFields>[number],
  { __typename: 'PicklistFormField' }
>;

interface PicklistProps {
  defaultValue?: string;
  field: PicklistType;
  name: string;
  onChange?: (value: string) => void;
  options: Array<{ label: string; entityId: string | number }>;
}

export const Picklist = ({ defaultValue, field, name, onChange, options }: PicklistProps) => {
  return (
    <Field className="relative space-y-2 pb-7" name={name}>
      <FieldLabel htmlFor={`field-${field.entityId}`} isRequired={field.isRequired}>
        {field.label}
      </FieldLabel>
      <FieldControl asChild>
        <Select
          aria-label={field.choosePrefix}
          defaultValue={defaultValue}
          id={`field-${field.entityId}`}
          onValueChange={field.entityId === FieldNameToFieldId.countryCode ? onChange : undefined}
          placeholder={field.choosePrefix}
          required={field.isRequired}
        >
          <SelectContent>
            {options.map(({ entityId, label }) => (
              <SelectItem key={entityId} value={entityId.toString()}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FieldControl>
    </Field>
  );
};
