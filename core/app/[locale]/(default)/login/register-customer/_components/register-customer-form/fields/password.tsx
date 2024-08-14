import { useTranslations } from 'next-intl';
import { ChangeEvent } from 'react';

import { Field, FieldControl, FieldLabel, FieldMessage, Input } from '~/components/ui/form';

import { CustomerFields } from '..';

import { FieldNameToFieldId } from './utils';

type PasswordType = Extract<
  NonNullable<CustomerFields>[number],
  { __typename: 'PasswordFormField' }
>;

interface PasswordProps {
  field: PasswordType;
  isValid?: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  name: string;
}

export const Password = ({ field, isValid, name, onChange }: PasswordProps) => {
  const t = useTranslations('Account.Register.validationMessages');
  const fieldName = FieldNameToFieldId[field.entityId];

  return (
    <Field className="relative space-y-2 pb-7" name={name}>
      <FieldLabel htmlFor={`field-${field.entityId}`} isRequired={field.isRequired}>
        {field.label}
      </FieldLabel>
      <FieldControl asChild>
        <Input
          defaultValue={field.defaultText ?? undefined}
          error={isValid === false}
          id={`field-${field.entityId}`}
          onChange={onChange}
          onInvalid={onChange}
          required={field.isRequired}
          type="password"
        />
      </FieldControl>
      {field.isRequired && (
        <FieldMessage
          className="absolute inset-x-0 bottom-0 inline-flex w-full text-xs font-normal text-error-secondary"
          match="valueMissing"
        >
          {t('password')}
        </FieldMessage>
      )}
      {fieldName === 'confirmPassword' && (
        <FieldMessage
          className="absolute inset-x-0 bottom-0 inline-flex w-full text-xs font-normal text-error-secondary"
          match={() => {
            return !isValid;
          }}
        >
          {t('confirmPassword')}
        </FieldMessage>
      )}
    </Field>
  );
};
