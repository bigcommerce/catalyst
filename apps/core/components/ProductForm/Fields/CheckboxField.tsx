import { Checkbox } from '@bigcommerce/reactant/Checkbox';
import { Label } from '@bigcommerce/reactant/Label';

import { getProduct } from '~/client/queries/getProduct';
import { ExistingResultType, Unpacked } from '~/client/util';

import { useProductFieldController } from '../useProductForm';

import { ErrorMessage } from './shared/ErrorMessage';

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
      <div className="flex flex-row items-center" key={option.entityId}>
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
