import { useTranslations } from 'next-intl';
import { ChangeEvent } from 'react';

import { Field, FieldControl, FieldLabel, FieldMessage } from '~/components/ui/form';
import { TextArea } from '~/components/ui/text-area';

import { CustomerFields } from '..';

type MultilineTextType = Extract<
  NonNullable<CustomerFields>[number],
  { __typename: 'MultilineTextFormField' }
>;

interface MultilineTextProps {
  field: MultilineTextType;
  name: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  isValid?: boolean;
  defaultValue?: string;
}

export const MultilineText = ({
  defaultValue,
  field,
  isValid,
  name,
  onChange,
}: MultilineTextProps) => {
  const t = useTranslations('Account.Register.validationMessages');

  return (
    <Field className="relative space-y-2 pb-7" name={name}>
      <FieldLabel htmlFor={`field-${field.entityId}`} isRequired={field.isRequired}>
        {field.label}
      </FieldLabel>
      <FieldControl asChild>
        <TextArea
          className="h-auto"
          defaultValue={defaultValue || field.defaultText || undefined}
          id={`field-${field.entityId}`}
          onChange={onChange}
          onInvalid={onChange}
          required
          rows={field.rows}
          variant={isValid === false ? 'error' : undefined}
        />
      </FieldControl>
      {field.isRequired && (
        <FieldMessage
          className="absolute inset-x-0 bottom-0 inline-flex w-full text-xs font-normal text-error-secondary"
          match="valueMissing"
        >
          {t('empty')}
        </FieldMessage>
      )}
    </Field>
  );
};
