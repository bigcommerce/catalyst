import { useTranslations } from 'next-intl';
import { ChangeEvent } from 'react';

import { Field, FieldControl, FieldLabel, FieldMessage, Input } from '~/components/ui/form';

import { FieldNameToFieldId } from './update-settings-form';

interface TextProps {
  defaultValue?: string;
  entityId: number;
  name?: string;
  isRequired?: boolean;
  isValid?: boolean;
  label: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: 'text' | 'email';
}

export const TextField = ({
  defaultValue,
  entityId,
  isRequired = false,
  isValid,
  name,
  label,
  onChange,
  type = 'text',
}: TextProps) => {
  const t = useTranslations('Components.FormFields.Validation');

  const fieldNameById = FieldNameToFieldId[entityId];
  const fieldId = name?.startsWith('custom_') ? `custom_field-${entityId}` : `field-${entityId}`;
  const fieldName = name || fieldNameById || fieldId;

  return (
    <Field className="relative space-y-2 pb-7" name={fieldName}>
      <FieldLabel htmlFor={fieldId} isRequired={isRequired}>
        {label}
      </FieldLabel>
      <FieldControl asChild>
        <Input
          defaultValue={defaultValue}
          error={isValid === false}
          id={`field-${entityId}`}
          onChange={isRequired ? onChange : undefined}
          onInvalid={isRequired ? onChange : undefined}
          required={isRequired}
          type={type}
        />
      </FieldControl>
      {isRequired && (
        <FieldMessage
          className="absolute inset-x-0 bottom-0 inline-flex w-full text-xs font-normal text-error"
          match="valueMissing"
        >
          {t(fieldNameById ?? 'empty')}
        </FieldMessage>
      )}
    </Field>
  );
};
