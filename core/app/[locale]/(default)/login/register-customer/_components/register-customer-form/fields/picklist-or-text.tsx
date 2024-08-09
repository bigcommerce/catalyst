import { useTranslations } from 'next-intl';

import { Field, FieldControl, FieldLabel, Input, Select } from '~/components/ui/form';

import { AddressFields } from '..';

type PicklistOrTextType = Extract<
  NonNullable<AddressFields>[number],
  { __typename: 'PicklistOrTextFormField' }
>;

interface PicklistOrTextProps {
  defaultValue?: string;
  field: PicklistOrTextType;
  name: string;
  options: Array<{ label: string; entityId: string | number }>;
  variant?: 'error';
}

export const PicklistOrText = ({ defaultValue, field, name, options }: PicklistOrTextProps) => {
  const t = useTranslations('Account.Register');

  return (
    <Field className="relative space-y-2 pb-7" name={name}>
      <FieldLabel
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
            label={t('stateProvincePrefix')}
            options={options.map(({ entityId, label }) => ({
              label,
              value: entityId.toString(),
            }))}
            placeholder={t('stateProvincePrefix')}
            required={field.isRequired}
          />
        )}
      </FieldControl>
    </Field>
  );
};
