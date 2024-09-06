import { FragmentOf } from 'gql.tada';
import { useTranslations } from 'next-intl';

import { Field, FieldControl, FieldLabel, FieldMessage, Select } from '~/components/ui/form';

import { FormFieldsFragment } from './fragment';
import { FieldNameToFieldId } from './utils';

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
        <Select
          aria-label={field.choosePrefix}
          defaultValue={defaultValue}
          error={isValid === false}
          id={`field-${field.entityId}`}
          onValueChange={
            field.entityId === FieldNameToFieldId.countryCode
              ? onChange
              : validateAgainstMissingValue
          }
          options={options.map(({ label, entityId }) => ({
            label,
            value: entityId.toString(),
          }))}
          placeholder={
            <span className="absolute inset-0 inline-flex w-5/6 items-center truncate ps-4">
              {field.choosePrefix}
            </span>
          }
          required={field.isRequired}
        />
      </FieldControl>
      <div className="relative h-7">
        {validationError && (
          <FieldMessage className="inline-flex w-full text-xs font-normal text-error-secondary">
            {t('empty')}
          </FieldMessage>
        )}
      </div>
    </Field>
  );
};
