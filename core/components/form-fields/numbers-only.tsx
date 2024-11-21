// NumbersOnly.tsx
import { FragmentOf } from 'gql.tada';
import { useTranslations } from 'next-intl';
import { ChangeEvent, KeyboardEvent } from 'react';

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

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    // Allow only numbers, backspace, delete, arrow keys, and tab
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
    const isNumber = /^[0-9]$/.test(e.key);

    if (!isNumber && !allowedKeys.includes(e.key)) {
      e.preventDefault();
    }
  };

  const handlePaste = (e: ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData?.getData('text');
    if (pastedText && /^\d+$/.test(pastedText)) {
      const input = e.target as HTMLInputElement;
      const currentValue = input.value;
      const selectionStart = input.selectionStart || 0;
      const selectionEnd = input.selectionEnd || 0;

      input.value =
        currentValue.substring(0, selectionStart) +
        pastedText +
        currentValue.substring(selectionEnd);

      // Trigger onChange event
      const event = new Event('input', { bubbles: true });
      input.dispatchEvent(event);
    }
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
      <FieldControl asChild>
        <Input
          defaultValue={field.defaultNumber ?? defaultValue}
          error={isValid === false}
          id={`field-${field.entityId}`}
          max={field.maxNumber ?? undefined}
          min={field.minNumber ?? undefined}
          minLength={field.minNumber ?? undefined}
          onChange={onChange}
          onInvalid={field.isRequired ? onChange : undefined}
          onKeyDown={handleKeyPress}
          onPaste={handlePaste as any}
          required={field.isRequired}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
        />
      </FieldControl>
      <div className="relative h-7">
        {field.isRequired && (
          <FieldMessage
            className="inline-flex w-full text-xs font-normal text-error-secondary"
            match="valueMissing"
          >
            {t('empty')}
          </FieldMessage>
        )}
        <FieldMessage
          className="inline-flex w-full text-xs font-normal text-error-secondary"
          match="typeMismatch"
        >
          {t('numbersOnly')}
        </FieldMessage>
        {Boolean(field.minNumber) && (
          <FieldMessage
            className="inline-flex w-full text-xs font-normal text-error-secondary"
            match="rangeUnderflow"
          >
            {t('numbersUnderflow', { min: field.minNumber })}
          </FieldMessage>
        )}
        {Boolean(field.maxNumber) && (
          <FieldMessage
            className="inline-flex w-full text-xs font-normal text-error-secondary"
            match="rangeOverflow"
          >
            {t('numbersOverflow', { max: field.maxNumber })}
          </FieldMessage>
        )}
      </div>
    </Field>
  );
};

export default NumbersOnly;
