import { FragmentOf } from 'gql.tada';
import { useTranslations } from 'next-intl';
import { ChangeEvent } from 'react';

import { Field, FieldControl, FieldLabel, FieldMessage, Input } from '~/components/ui/form';

import { FormFieldsFragment } from './fragment';

type NumbersOnlyType = Extract<
  FragmentOf<typeof FormFieldsFragment>,
  { __typename: 'NumberFormField' }
>;

interface NumbersOnlyProps {
  field: NumbersOnlyType;
  name: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  isValid?: boolean;
  defaultValue?: number;
}

export const NumbersOnly = ({ defaultValue, field, isValid, name, onChange }: NumbersOnlyProps) => {
  const t = useTranslations('Components.FormFields.Validation');

  return (
    <Field className="relative space-y-2" name={name}>
      <FieldLabel
        className="font-semibold"
        htmlFor={`field-${field.entityId}`}
        isRequired={field.isRequired}
      >
        {field.label}
      </FieldLabel>
      <FieldControl asChild>
        <Input
          defaultValue={field.defaultNumber ?? defaultValue}
          error={isValid === false}
          id={`field-${field.entityId}`}
          max={field.maxNumber ?? undefined}
          min={field.minNumber ?? undefined}
          minLength={field.minNumber ?? undefined}
          onChange={field.isRequired ? onChange : undefined}
          onInvalid={field.isRequired ? onChange : undefined}
          required={field.isRequired}
          type="number"
        />
      </FieldControl>
      <div className="relative h-7">
        {field.isRequired && (
          <FieldMessage
            className="inline-flex w-full text-xs font-normal text-error"
            match="valueMissing"
          >
            {t('empty')}
          </FieldMessage>
        )}
        <FieldMessage
          className="inline-flex w-full text-xs font-normal text-error"
          match="typeMismatch"
        >
          {t('numbersOnly')}
        </FieldMessage>
        {Boolean(field.minNumber) && (
          <FieldMessage
            className="inline-flex w-full text-xs font-normal text-error"
            match="rangeUnderflow"
          >
            {t('numbersUnderflow', { min: field.minNumber })}
          </FieldMessage>
        )}
        {Boolean(field.maxNumber) && (
          <FieldMessage
            className="inline-flex w-full text-xs font-normal text-error"
            match="rangeOverflow"
          >
            {t('numbersOverflow', { max: field.maxNumber })}
          </FieldMessage>
        )}
      </div>
    </Field>
  );
};
