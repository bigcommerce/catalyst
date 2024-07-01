import { useTranslations } from 'next-intl';
import { ChangeEvent } from 'react';

import { Field, FieldLabel, FieldMessage } from '~/components/ui/form';
import { Label } from '~/components/ui/label';
import { RadioGroup, RadioItem } from '~/components/ui/radio-group';

import { AddressFields } from '..';

type RadioButtonsType = Extract<
  NonNullable<AddressFields>[number],
  { __typename: 'RadioButtonsFormField' }
>;

interface RadioButtonsTypeProps {
  defaultValue?: string;
  field: RadioButtonsType;
  isValid?: boolean;
  name: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

export const RadioButtons = ({
  defaultValue,
  field,
  isValid,
  name,
  onChange,
}: RadioButtonsTypeProps) => {
  const t = useTranslations('Account.Register.validationMessages');
  const validationError = field.isRequired && isValid === false;

  return (
    <Field className="relative space-y-2 pb-7" name={name}>
      <FieldLabel htmlFor={`field-${field.entityId}`} isRequired={field.isRequired}>
        {field.label}
      </FieldLabel>
      <RadioGroup
        aria-label={name}
        defaultValue={defaultValue}
        name={name}
        onChange={onChange}
        onInvalid={onChange}
        required={field.isRequired}
      >
        {field.options.map((option) => {
          const itemId = option.entityId;

          return (
            <div className="mb-2 flex" key={itemId}>
              <RadioItem
                id={`${itemId}`}
                value={`${itemId}`}
                variant={validationError ? 'error' : undefined}
              />
              <Label className="w-full cursor-pointer ps-4 font-normal" htmlFor={`${itemId}`}>
                <p className="inline-flex w-full justify-between">{option.label}</p>
              </Label>
            </div>
          );
        })}
      </RadioGroup>
      {validationError && (
        <FieldMessage className="absolute inset-x-0 bottom-0 inline-flex w-full text-xs font-normal text-error-secondary">
          {t('empty')}
        </FieldMessage>
      )}
    </Field>
  );
};
