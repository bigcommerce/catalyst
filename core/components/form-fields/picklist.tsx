import { FragmentOf } from 'gql.tada';
import { useTranslations } from 'next-intl';

import { Field, FieldControl, FieldLabel, FieldMessage, Select } from '~/components/ui/form';

import { FormFieldsFragment } from './fragment';
import { FieldNameToFieldId } from './utils';
import { useState } from 'react';

type PicklistType = Extract<
  FragmentOf<typeof FormFieldsFragment>,
  { __typename: 'PicklistFormField' }
>;

type PicklistValidationState = Record<string, boolean>;

interface PicklistProps {
  defaultValue?: string;
  field: PicklistType;
  name: string;
  isValid?: boolean;
  onChange?: (value: string) => void;
  onValidate?: (
    state:
      | PicklistValidationState
      | ((prevState: PicklistValidationState) => PicklistValidationState),
  ) => void;
  options: Array<{ label: string; entityId: string | number }>;
  selectedOption?: string;
  setSelectedOption?: any;
  selectError?: string;
  setSelectError?: any;
}

export const Picklist = ({
  defaultValue,
  field,
  name,
  isValid,
  onChange,
  onValidate,
  options,
  selectedOption,
  setSelectedOption,
  selectError,
  setSelectError,
}: PicklistProps) => {
  const t = useTranslations('Components.FormFields.Validation');

  const validationError = field.isRequired && isValid === false;
  const validateAgainstMissingValue =
    !field.isBuiltIn && field.isRequired
      ? (value: string) => {
          if (onValidate) {
            onValidate((prevValidityState) => ({
              ...prevValidityState,
              [field.entityId.toString()]: value.length > 0,
            }));
          }
        }
      : undefined;

  const handleValueChange = (value: string) => {
    if (field.label === 'I am a:*') {
      setSelectedOption(value);
        if(selectedOption == '15'){
          setSelectError('Please select an option.')
        } else {
          setSelectError('');
        }
    }

    if (field.entityId === FieldNameToFieldId.countryCode) {
      if (onChange) {
        onChange(value);
      }
    } else if (validateAgainstMissingValue) {
      validateAgainstMissingValue(value);
    }
  };

  return (
    <Field className="mm4 relative space-y-2" name={name}>
      <FieldLabel
        className="font-semibold"
        htmlFor={`field-${field.entityId}`}
        isRequired={field.isRequired}
      >
        {field.label}
      </FieldLabel>
      <FieldControl asChild>
        <Select
          selectError={selectError}
          aria-label={field.choosePrefix}
          defaultValue={defaultValue}
          error={isValid === false}
          id={`field-${field.entityId}`}
          onValueChange={handleValueChange}
          options={options.map(({ label, entityId }) => ({
            label,
            value: entityId.toString(),
          }))}
          placeholder={
            <span className="absolute inset-0 inline-flex w-5/6 items-center truncate ps-4">
              {field.choosePrefix}
            </span>
          }
          // required={field.isRequired}
          required={field.label === 'I am a:*' ? field.isRequired = false : field.isRequired}
        />
      </FieldControl>
      <div className="relative h-7">
        {/* {(selectError || validationError) && ( */}
        {(selectError) && (
          <FieldMessage className="inline-flex w-full text-xs font-normal text-[#A71F23]">
            {t('empty')}
          </FieldMessage>
        )}
      </div>
    </Field>
  );
};
