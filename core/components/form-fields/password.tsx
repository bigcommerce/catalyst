// password-input.tsx

import { FragmentOf } from 'gql.tada';
import { useTranslations } from 'next-intl';
import { ChangeEvent } from 'react';

import { Field, FieldControl, FieldLabel, FieldMessage, Input } from '~/components/ui/form';

import { FormFieldsFragment } from './fragment';
import { FieldNameToFieldId } from './utils';

type PasswordType = Extract<
  FragmentOf<typeof FormFieldsFragment>,
  { __typename: 'PasswordFormField' }
>;

interface PasswordProps {
  defaultValue?: string;
  field: PasswordType;
  isValid?: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  name: string;
}

export const Password = ({ defaultValue, field, isValid, name, onChange }: PasswordProps) => {
  const t = useTranslations('Components.FormFields.Validation');

  const fieldName = FieldNameToFieldId[field.entityId];

  return (
    <Field className="relative space-y-2 mm3" name={name}>
      <FieldLabel
        className="font-semibold"
        htmlFor={`field-${field.entityId}`}
        isRequired={field.isRequired}
      >
        {field.label}
      </FieldLabel>
      <FieldControl asChild>
        <Input
          defaultValue={defaultValue || field.defaultText || undefined}
          error={isValid === false}
          id={`field-${field.entityId}`}
          onChange={onChange}
          onInvalid={onChange}
          required={field.isRequired}
          type="password"
          className='[&_input]:tracking-[0.5px] [&_input]:h-[47.2px] [&_input[type="password"]]:text-[20px]'
        />
      </FieldControl>
      <div className="relative h-7 pass1">
        {field.isRequired && (
          <FieldMessage
            className="inline-flex w-full text-xs font-normal text-error-secondary relative text-[#ff4500]"
            match="valueMissing"
          >
            {t('password')}
          </FieldMessage>
        )}
        {fieldName === 'confirmPassword' && (
          <FieldMessage
            className="inline-flex w-full text-xs font-normal text-error text-[#ff4500]"
            match={() => {
              return !isValid;
            }}
          >
            {t('confirmPassword')}
          </FieldMessage>
        )}
      </div>
    </Field>
  );
};