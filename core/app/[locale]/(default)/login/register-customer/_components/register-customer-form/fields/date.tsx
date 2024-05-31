import { useTranslations } from 'next-intl';
import React, { ChangeEvent, useState } from 'react';

import { DatePicker } from '~/components/ui/date-picker';
import { Field, FieldControl, FieldLabel, FieldMessage } from '~/components/ui/form';

import { AddressFields } from '..';

const getDisabledDays = ({
  earliest,
  latest,
}: {
  earliest: string | null;
  latest: string | null;
}) => {
  if (earliest && latest) {
    return [{ before: new Date(earliest), after: new Date(latest) }];
  }

  if (earliest) {
    return [{ before: new Date(earliest) }];
  }

  if (latest) {
    return [{ after: new Date(latest) }];
  }

  return [];
};

type DateType = Extract<NonNullable<AddressFields>[number], { __typename: 'DateFormField' }>;

interface DateProps {
  defaultValue?: Date | string;
  field: DateType;
  isValid?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onValidate?: (
    state:
      | Record<string, boolean>
      | ((prevState: Record<string, boolean>) => Record<string, boolean>),
  ) => void;
  name: string;
}

export const DateField = ({
  defaultValue,
  field,
  isValid,
  onChange,
  onValidate,
  name,
}: DateProps) => {
  const selectedDate = defaultValue || field.defaultDate || undefined;
  const [date, setDate] = useState<Date | string | undefined>(selectedDate);
  const t = useTranslations('Account.Register.validationMessages');
  const disabledDays = getDisabledDays({ earliest: field.minDate, latest: field.maxDate });
  const handleDateSelect = field.isRequired
    ? (d: Date | undefined) => {
        if (onValidate) {
          onValidate((datesState: Record<string, boolean>) => ({
            ...datesState,
            [field.entityId.toString()]: Boolean(d),
          }));
        }

        setDate(d);
      }
    : (d?: Date) => setDate(d);

  return (
    <Field className="relative space-y-2 pb-7" name={name}>
      <FieldLabel htmlFor={`field-${field.entityId}`} isRequired={field.isRequired}>
        {field.label}
      </FieldLabel>
      <FieldControl asChild>
        <DatePicker
          disabledDays={disabledDays}
          error={isValid === false}
          id={`${field.entityId}`}
          onChange={field.isRequired ? onChange : undefined}
          onInvalid={field.isRequired ? onChange : undefined}
          onSelect={handleDateSelect}
          required={field.isRequired}
          selected={date ? new Date(date) : undefined}
          variant={isValid === false ? 'error' : undefined}
        />
      </FieldControl>
      {field.isRequired && !isValid && (
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
