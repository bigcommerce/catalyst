// password-input.tsx

import { FragmentOf } from 'gql.tada';
import { useTranslations } from 'next-intl';
import { ChangeEvent, useState } from 'react';

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
  const [passwordError, setPasswordError] = useState<string>('');

  const validatePassword = (password: string) => {
    if (fieldName === 'password') {
      const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

      if (!password.trim()) {
        setPasswordError('');
        return true;
      }

      if (!passwordRegex.test(password)) {
        setPasswordError('Include uppercase, lowercase, number, symbol (8+ chars).');
        return false;
      }

      setPasswordError('');
      return true;
    }
  };

  return (
    <Field className="mm3 relative space-y-2" name={name}>
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
          className='[&_input[type="password"]]:text-[20px] [&_input]:h-[47.2px] [&_input]:tracking-[0.5px]'
          onBlur={(e) => {
            validatePassword((e.target as HTMLInputElement).value);
          }}
        />
      </FieldControl>
      <FieldMessage className='font-normal text-[14px] leading-[24px] tracking-[0.25px] mt-0 text-[#353535]'>Include uppercase, lowercase, number, symbol (8+ chars).</FieldMessage>
      {passwordError && 
      <div className='w-full text-xs font-normal text-[#A71F23] absolute bottom-[7%]'>{passwordError}</div>
      }
      <div className="pass1 relative h-7">
        {field.isRequired && (
          <FieldMessage
            className="text-error-secondary relative inline-flex w-full text-xs font-normal text-[#A71F23]"
            match="valueMissing"
          >
            {t('password')}
          </FieldMessage>
        )}
        {fieldName === 'confirmPassword' && (
          <FieldMessage
            className="inline-flex w-full text-xs font-normal text-[#A71F23] text-error"
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
