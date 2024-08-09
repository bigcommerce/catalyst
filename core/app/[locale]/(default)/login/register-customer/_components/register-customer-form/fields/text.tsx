import { useTranslations } from 'next-intl';
import { ChangeEvent } from 'react';

import { Field, FieldControl, FieldLabel, FieldMessage, Input } from '~/components/ui/form';

import { CustomerFields } from '..';

import { FieldNameToFieldId } from './utils';

type TextType = Extract<NonNullable<CustomerFields>[number], { __typename: 'TextFormField' }>;

interface TextProps {
  defaultValue?: string;
  field: TextType;
  isValid?: boolean;
  name: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}

export const Text = ({ defaultValue, field, isValid, name, onChange, type }: TextProps) => {
  const t = useTranslations('Account.Register.validationMessages');
  const fieldName = FieldNameToFieldId[field.entityId];

  return (
    <Field className="relative space-y-2 pb-7" name={name}>
      <FieldLabel htmlFor={`field-${field.entityId}`} isRequired={field.isRequired}>
        {field.label}
      </FieldLabel>
      <FieldControl asChild>
        <Input
          defaultValue={field.defaultText ?? defaultValue}
          error={isValid === false}
          id={`field-${field.entityId}`}
          maxLength={field.maxLength ?? undefined}
          onChange={field.isRequired ? onChange : undefined}
          onInvalid={field.isRequired ? onChange : undefined}
          required={field.isRequired}
          type={type === 'email' ? 'email' : 'text'}
        />
      </FieldControl>
      {field.isRequired && (
        <FieldMessage
          className="absolute inset-x-0 bottom-0 inline-flex w-full text-xs font-normal text-error-secondary"
          match="valueMissing"
        >
          {t(fieldName ?? 'empty')}
        </FieldMessage>
      )}
      {fieldName === 'email' && (
        <FieldMessage
          className="absolute inset-x-0 bottom-0 inline-flex w-full text-xs font-normal text-error-secondary"
          match="typeMismatch"
        >
          {t('email')}
        </FieldMessage>
      )}
    </Field>
  );
};
