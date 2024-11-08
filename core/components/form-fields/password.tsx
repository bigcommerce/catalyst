import { FragmentOf } from 'gql.tada';
import { useTranslations } from 'next-intl';
import { ChangeEvent, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);
  const [inputValue, setInputValue] = useState(defaultValue || field.defaultText || '');

  const fieldName = FieldNameToFieldId[field.entityId];

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    onChange(e);
  };

  return (
    <Field className="relative space-y-2" name={name}>
      <FieldLabel
        className="font-semibold"
        htmlFor={`field-${field.entityId}`}
        isRequired={field.isRequired}
      >
        {field.label}
      </FieldLabel>
      <div className="relative">
        <FieldControl asChild>
          <Input
            defaultValue={defaultValue || field.defaultText || undefined}
            error={isValid === false}
            id={`field-${field.entityId}`}
            onChange={handleInputChange}
            onInvalid={onChange}
            required={field.isRequired}
            type={showPassword ? 'text' : 'password'}
            value={inputValue}
          />
        </FieldControl>
        {inputValue.length > 0 && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-black hover:text-gray-700 focus:outline-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {!showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        )}
      </div>
      <div className="relative h-7">
        {field.isRequired && (
          <FieldMessage
            className="validation-error-password relative -top-3 inline-flex w-full text-xs font-normal text-error-secondary"
            match="valueMissing"
          >
            {t('password')}
          </FieldMessage>
        )}
        {fieldName === 'confirmPassword' && (
          <FieldMessage
            className="validation-error-confirm-password relative -top-3 inline-flex w-full text-xs font-normal text-error-secondary"
            match={() => !isValid}
          >
            {t('confirmPassword')}
          </FieldMessage>
        )}
      </div>
    </Field>
  );
};

export default Password;