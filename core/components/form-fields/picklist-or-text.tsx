import { FragmentOf } from 'gql.tada';
 
import { Field, FieldControl, FieldLabel, FieldMessage, Input, Select } from '~/components/ui/form';
 
import { FormFieldsFragment } from './fragment';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Value } from '@radix-ui/react-select';
 
type PicklistOrTextType = Extract<
  FragmentOf<typeof FormFieldsFragment>,
  { __typename: 'PicklistOrTextFormField' }
>;
 
interface PicklistOrTextProps {
  defaultValue?: string;
  field: PicklistOrTextType;
  name: string;
  options: Array<{ label: string; entityId: string | number }>;
  variant?: 'error';
  onValidate?: (isValid: boolean) => void;
  isValid?: boolean;
  selectedOption?: string;
  setSelectedOption?: any;
  selectError?: string;
  setSelectError?: any;
  formErrors?: { [key: string]: string };
  onSelectChange?: (field: string, value: string) => void;
  from?: string;
  stateValueApi?: string;
  setStateValueApi?: any;
  isCountryCode?: boolean;
  lastChangedField?:string;
  inputApi?:any;
  setFormValues?:setFormValues;
}
 
export const PicklistOrText = ({
  defaultValue,
  field,
  name,
  options,
  formErrors,
  onSelectChange,
  from,
  stateValueApi,
  setStateValueApi,
  isCountryCode,
  lastChangedField,
  inputApi,
  setFormValues
}: PicklistOrTextProps) => {
  const t = useTranslations('Components.FormFields.Validation');
 
  const handleValueChange = (value: string) => {
    if (from === 'register-form2' && field.label === 'State*' && lastChangedField === 'state') {
      setStateValueApi(inputApi.state = value);
    }
    onSelectChange?.(field.label, value);
  };
 
  useEffect(() => {
    if (from === 'register-form2' && field.label === 'State*' && inputApi?.state) {
      setFormValues((prev: any) => ({
        ...prev,
        ['State*']: inputApi.state,
      }));
    }
  }, [inputApi?.state]);
 
  return (
    <Field className="relative space-y-2" name={name}>
      <FieldLabel
        className="font-semibold"
        htmlFor={`field-${field.entityId}`}
        isRequired={options.length !== 0 ? field.isRequired : false}
      >
        {field.label}
      </FieldLabel>
      <FieldControl asChild>
        {options.length === 0 ? (
          <Input id={`field-${field.entityId}`} type="text" />
        ) : from === 'register-form2' && isCountryCode === false ? (
          <Input id={`field-${field.entityId}`} type="text" />
        ) : (
          <Select
            defaultValue={defaultValue}
            id={`field-${field.entityId}`}
            key={defaultValue}
            options={options.map(({ entityId, label }) => ({
              label,
              value: entityId.toString(),
            }))}
            required={field.isRequired}
            onValueChange={handleValueChange}
            value={
              (from === 'register-form2' && (field.label === 'State*' ? stateValueApi : null)) ||
              undefined
            }
          />
        )}
      </FieldControl>
      <div className="relative h-7">
        {formErrors?.[field.label] && (
          <FieldMessage className="inline-flex w-full text-xs font-normal text-[#A71F23]">
            {t('empty')}
          </FieldMessage>
        )}
      </div>
    </Field>
  );
};