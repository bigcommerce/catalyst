'use client';

import { FragmentOf } from 'gql.tada';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';

import { Checkbox, Field, FieldLabel, FieldMessage, Label } from '~/components/ui/form';

import { FormFieldsFragment } from './fragment';

type CheckboxesType = Extract<
  FragmentOf<typeof FormFieldsFragment>,
  { __typename: 'CheckboxesFormField' }
>;

type CheckboxesValidationState = Record<string, boolean>;

interface CheckboxesTypeProps {
  defaultValue?: number[];
  field: CheckboxesType;
  name: string;
  isValid?: boolean;
  onChange?: (value: string) => void;
  onValidate?: (
    state:
      | CheckboxesValidationState
      | ((prevState: CheckboxesValidationState) => CheckboxesValidationState),
  ) => void;
  options: Array<{ label: string; entityId: string | number }>;
}

export const Checkboxes = ({
  defaultValue,
  field,
  name,
  isValid,
  onValidate,
  options,
}: CheckboxesTypeProps) => {
  const t = useTranslations('Components.FormFields.Validation');

  const validationError = field.isRequired && isValid === false;
  const [checkboxValues, setCheckboxValues] = useState(defaultValue ?? []);
  const checkboxId = field.entityId.toString();
  const setCheckboxValidityState = useCallback(
    (validityStatus: boolean, validitySetter?: typeof onValidate) => {
      if (validitySetter) {
        validitySetter((prevState) => ({
          ...prevState,
          [checkboxId]: validityStatus,
        }));
      }
    },
    [checkboxId],
  );

  useEffect(() => {
    setCheckboxValidityState(checkboxValues.length > 0, onValidate);
  }, [checkboxValues, onValidate, checkboxId, setCheckboxValues, setCheckboxValidityState]);

  useEffect(() => {
    setCheckboxValidityState(true, onValidate);
  }, [onValidate, setCheckboxValidityState]);

  return (
    <Field className="relative space-y-2" name={name}>
      <fieldset>
        <FieldLabel asChild>
          <legend className="mb-2.5 inline-flex w-full items-center justify-between text-base font-semibold">
            <span>{field.label}</span>
            {field.isRequired && (
              <span className="text-xs font-normal text-gray-500">Required</span>
            )}
          </legend>
        </FieldLabel>
        <div className="flex flex-col">
          {options.map(({ label, entityId }) => {
            const optionId = `option-${checkboxId}-${entityId}`;

            return (
              <div className="inline-flex py-2 ps-1" key={entityId}>
                <Checkbox
                  aria-labelledby={`${entityId}`}
                  checked={checkboxValues.includes(Number(entityId))}
                  error={validationError}
                  id={optionId}
                  name={name}
                  onCheckedChange={(checked: boolean) => {
                    if (checked) {
                      setCheckboxValues((prevState) => [...prevState, +entityId]);
                    } else {
                      setCheckboxValues((prevState) => {
                        return prevState.filter((prevValue) => prevValue !== +entityId);
                      });
                    }
                  }}
                  required={field.isRequired && checkboxValues.length === 0 ? true : undefined}
                  value={entityId}
                />
                <Label
                  className="cursor-pointer ps-3 font-normal"
                  htmlFor={optionId}
                  id={`${entityId}`}
                >
                  {label}
                </Label>
              </div>
            );
          })}
        </div>
        <div className="relative h-7">
          {validationError && (
            <FieldMessage className="inline-flex w-full text-xs font-normal text-error-secondary">
              {t('empty')}
            </FieldMessage>
          )}
        </div>
      </fieldset>
    </Field>
  );
};
