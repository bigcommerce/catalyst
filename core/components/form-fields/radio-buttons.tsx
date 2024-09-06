import { FragmentOf } from 'gql.tada';
import { useTranslations } from 'next-intl';
import { ChangeEvent } from 'react';

import { Field, FieldLabel, FieldMessage, RadioGroup } from '~/components/ui/form';

import { FormFieldsFragment } from './fragment';

type RadioButtonsType = Extract<
  FragmentOf<typeof FormFieldsFragment>,
  { __typename: 'RadioButtonsFormField' }
>;

interface RadioButtonsTypeProps {
  defaultValue?: string;
  field: RadioButtonsType;
  isValid?: boolean;
  name: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

export const RadioButtons = ({
  defaultValue,
  field,
  isValid,
  name,
  onChange,
}: RadioButtonsTypeProps) => {
  const t = useTranslations('Components.FormFields.Validation');

  const validationError = field.isRequired && isValid === false;

  return (
    <Field className="relative space-y-2" name={name}>
      <fieldset>
        <FieldLabel asChild id={name}>
          <legend className="mb-2.5 inline-flex w-full items-center justify-between text-base font-semibold">
            <span>{field.label}</span>
            {field.isRequired && (
              <span className="text-xs font-normal text-gray-500">Required</span>
            )}
          </legend>
        </FieldLabel>
        <RadioGroup
          aria-labelledby={name}
          defaultValue={defaultValue}
          error={validationError}
          items={field.options.map(({ label, entityId }) => ({
            label,
            value: entityId.toString(),
          }))}
          name={name}
          onChange={onChange}
          onInvalid={onChange}
          required={field.isRequired}
        />
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
