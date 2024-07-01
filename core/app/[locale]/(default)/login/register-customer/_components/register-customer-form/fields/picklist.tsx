import { useTranslations } from 'next-intl';

import { Field, FieldControl, FieldLabel, FieldMessage } from '~/components/ui/form';
import { Select, SelectContent, SelectItem } from '~/components/ui/select';

import { AddressFields } from '..';

import { FieldNameToFieldId } from './utils';

type PicklistType = Extract<
  NonNullable<AddressFields>[number],
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
}

export const Picklist = ({
  defaultValue,
  field,
  name,
  isValid,
  onChange,
  onValidate,
  options,
}: PicklistProps) => {
  const t = useTranslations('Account.Register.validationMessages');
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

  return (
    <Field className="relative space-y-2 pb-7" name={name}>
      <FieldLabel htmlFor={`field-${field.entityId}`} isRequired={field.isRequired}>
        {field.label}
      </FieldLabel>
      <FieldControl asChild>
        <Select
          aria-label={field.choosePrefix}
          defaultValue={defaultValue}
          id={`field-${field.entityId}`}
          onValueChange={
            field.entityId === FieldNameToFieldId.countryCode
              ? onChange
              : validateAgainstMissingValue
          }
          placeholder={field.choosePrefix}
          required={field.isRequired}
          variant={isValid === false ? 'error' : undefined}
        >
          <SelectContent>
            {options.map(({ entityId, label }) => (
              <SelectItem key={entityId} value={entityId.toString()}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FieldControl>
      {validationError && (
        <FieldMessage className="absolute inset-x-0 bottom-0 inline-flex w-full text-xs font-normal text-error-secondary">
          {t('empty')}
        </FieldMessage>
      )}
    </Field>
  );
};
