import { FragmentOf } from 'gql.tada';
import { useTranslations } from 'next-intl';
import { ChangeEvent } from 'react';

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
}

export const Text = ({ defaultValue, field, isValid, name, onChange, type }: TextProps) => {
  const t = useTranslations('Components.FormFields.Validation');

  const fieldName = FieldNameToFieldId[field.entityId];

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
          defaultValue={defaultValue || field.defaultText || ''}
          error={isValid === false}
          id={`field-${field.entityId}`}
          maxLength={field.maxLength ?? undefined}
          onChange={field.isRequired ? onChange : undefined}
          onInvalid={field.isRequired ? onChange : undefined}
          required={field.isRequired}
          type={type === 'email' ? 'email' : 'text'}
        />
      </FieldControl>
      <div className="relative h-7">
        {field.isRequired && (
          <FieldMessage
            className="inline-flex w-full text-xs font-normal text-error-secondary"
            match="valueMissing"
          >
            {t(fieldName ?? 'empty')}
          </FieldMessage>
        )}
        {fieldName === 'email' && (
          <FieldMessage
            className="inline-flex w-full text-xs font-normal text-error-secondary"
            match="typeMismatch"
          >
            {t('email')}
          </FieldMessage>
        )}
      </div>
    </Field>
  );
};
