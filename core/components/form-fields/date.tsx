'use client';

import { FragmentOf } from 'gql.tada';
import { useTranslations } from 'next-intl';
import React, { ChangeEvent, useState } from 'react';

import { DatePicker, Field, FieldLabel, FieldMessage } from '~/components/ui/form';

import { FormFieldsFragment } from './fragment';

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

type DateType = Extract<FragmentOf<typeof FormFieldsFragment>, { __typename: 'DateFormField' }>;

interface DateProps {
  defaultValue?: Date | string;
  field: DateType;
  isValid?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement> & { nativeEvent: { inputType: string } }) => void;
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
  const t = useTranslations('Components.FormFields.Validation');

  const selectedDate = defaultValue || field.defaultDate || undefined;
  const [date, setDate] = useState<Date | string | undefined>(selectedDate);
  const disabledDays = getDisabledDays({ earliest: field.minDate, latest: field.maxDate });
  const validationError = field.isRequired && isValid === false;
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
      <fieldset className="space-y-2">
        <FieldLabel className="font-semibold" htmlFor={name} isRequired={field.isRequired}>
          {field.label}
        </FieldLabel>
        <input
          id={`field-${field.entityId}`}
          name={name}
          type="hidden"
          value={date ? new Date(date).toLocaleDateString('en-US') : ''}
        />
        <DatePicker
          disabledDays={disabledDays}
          error={isValid === false}
          id={name}
          onChange={field.isRequired ? onChange : undefined}
          onInvalid={field.isRequired ? onChange : undefined}
          onSelect={handleDateSelect}
          required={field.isRequired}
          selected={date ? new Date(date) : undefined}
        />
        <div className="relative h-7">
          {validationError && (
            <FieldMessage className="inline-flex w-full text-xs font-normal text-error">
              {t('empty')}
            </FieldMessage>
          )}
        </div>
      </fieldset>
    </Field>
  );
};
