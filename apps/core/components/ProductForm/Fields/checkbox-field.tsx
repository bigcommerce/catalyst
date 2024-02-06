import { Checkbox } from '@bigcommerce/components/Checkbox';
import { Label } from '@bigcommerce/components/Label';

import { getProduct } from '~/client/queries/get-product';
import { ExistingResultType, Unpacked } from '~/client/util';

import { useProductFieldController } from '../use-product-form';

import { ErrorMessage } from './shared/error-message';

type CheckboxOption = Extract<
  Unpacked<ExistingResultType<typeof getProduct>['productOptions']>,
  { __typename: 'CheckboxOption' }
>;

export const CheckboxField = ({ option }: { option: CheckboxOption }) => {
  const { field, fieldState } = useProductFieldController({
    name: `attribute_${option.entityId}`,
    rules: {
      required: option.isRequired ? 'You must include this option.' : false,
    },
    defaultValue: option.checkedByDefault ? option.checkedOptionValueEntityId : '',
  });
  const { error } = fieldState;

  return (
    <fieldset>
      <legend className="inline-block pb-2 font-semibold">
        {option.isRequired ? (
          <>
            {option.displayName} <span className="font-normal text-gray-500">(required)</span>
          </>
        ) : (
          option.displayName
        )}
      </legend>
      <div className="flex items-center" key={option.entityId}>
        <Checkbox
          id={`${option.entityId}`}
          name={field.name}
          onCheckedChange={(checked) => {
            if (checked) {
              field.onChange(option.checkedOptionValueEntityId);
            } else {
              field.onChange('');
            }
          }}
          value={field.value}
        />
        <Label className="mx-3 font-normal" htmlFor={`${option.entityId}`}>
          {option.label}
        </Label>
      </div>
      {error && <ErrorMessage>{error.message}</ErrorMessage>}
    </fieldset>
  );
};
