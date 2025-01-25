import { FragmentOf } from 'gql.tada';
import { useTranslations } from 'next-intl';
import { ChangeEvent, useState } from 'react';

import { Field, FieldControl, FieldLabel, FieldMessage, Input } from '~/components/ui/form';

import { FormFieldsFragment } from './fragment';
import { FieldNameToFieldId } from './utils';

type TextType = Extract<FragmentOf<typeof FormFieldsFragment>, { __typename: 'TextFormField' }>;

interface TextProps {
  defaultValue?: string;
  field: TextType;
  isValid?: boolean;
  name: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  emailExists?: string;
  from?: string;
  textInputValError?:any;
}

export const Text = ({ defaultValue, field, isValid, name, onChange, type, emailExists, from,textInputValError }: TextProps) => {
  const t = useTranslations('Components.FormFields.Validation');

  const fieldName = FieldNameToFieldId[field.entityId];
  const [emailError, setEmailError] = useState('');

  let validateErrorId;
  let isValidateErrorId
  if(from == 'register-form2'){
    validateErrorId= textInputValError && Object.keys(textInputValError)
    isValidateErrorId = validateErrorId.includes(String(field.entityId))
  } 

  const validateEmail = (email: string) => {
    if (!email.trim()) {
      setEmailError('Enter a valid email such as name@domain.com');
      return false;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  return (
    <Field className="relative space-y-2" name={name}>
      <FieldLabel
        className="font-semibold"
        htmlFor={`field-${field.entityId}`}
        isRequired={field.isRequired}
      >
        {field.label == "Email Address" ? "Email Address (Login ID)" : field.label}{field.isRequired ? "*":""}</FieldLabel>
      <FieldControl asChild>
        <Input
          defaultValue={defaultValue || field.defaultText || ''}
          error={isValid === false}
          id={`field-${field.entityId}`}
          maxLength={field.maxLength ?? undefined}
          onChange={field.isRequired ? onChange : undefined}
          onInvalid={from !== 'register-form2' && field.isRequired ? onChange : undefined}
          required={ from !== 'register-form2' ? field.isRequired : false}
          type={type === 'email' ? 'email' : 'text'}
          placeholder={field.label === 'Address Line 1*' ? 'Start typing your address.' : ''}
          onBlur={(e) => {
            if (type === 'email') {
              validateEmail((e.target as HTMLInputElement).value);
            }
          }}
          emailExists={emailExists}
        />
      </FieldControl>
      <div className="pass2 relative h-7">
        {(from !== 'register-form2' && field.isRequired) && (
          <FieldMessage
            className="text-error-secondary validation-error-email relative inline-flex w-full text-xs font-normal text-[#A71F23]"
            match="valueMissing"
          >
            {t(fieldName ?? 'empty')}
          </FieldMessage>
        )}
        {(from == 'register-form2' && isValidateErrorId && field.entityId ) && (
          <FieldMessage
            className="text-error-secondary validation-error-13 inline-flex w-full text-xs font-normal text-[#A71F23]"
          >
            {t(fieldName ?? 'empty')}
          </FieldMessage>
        )}
        {fieldName === 'email' && emailError && (
          <FieldMessage
            className="text-error-secondary validation-error-13 inline-flex w-full text-xs font-normal text-[#A71F23]"
            match="typeMismatch"
          >
            {emailError}
          </FieldMessage>
        )}
      </div>
    </Field>
  );
};
