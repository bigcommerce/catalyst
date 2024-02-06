import { Counter } from '@bigcommerce/components/Counter';
import { Label } from '@bigcommerce/components/Label';

import { getProduct } from '~/client/queries/get-product';
import { ExistingResultType, Unpacked } from '~/client/util';

import { useProductFieldController } from '../use-product-form';

import { ErrorMessage } from './shared/error-message';

type NumberFieldOption = Extract<
  Unpacked<ExistingResultType<typeof getProduct>['productOptions']>,
  { __typename: 'NumberFieldOption' }
>;

export const NumberField = ({ option }: { option: NumberFieldOption }) => {
  const { field, fieldState } = useProductFieldController({
    name: `attribute_${option.entityId}`,
    rules: {
      required: option.isRequired ? 'Please enter a number.' : false,
      min: option.lowest
        ? {
            value: option.lowest,
            message: `Number must be equal or higher than ${option.lowest}.`,
          }
        : undefined,
      max: option.highest
        ? {
            value: option.highest,
            message: `Number must be equal or lower than ${option.highest}.`,
          }
        : undefined,
    },
    defaultValue: option.defaultNumber ?? '',
  });
  const { error } = fieldState;

  return (
    <div>
      <Label className="mb-2 inline-block" htmlFor={`${option.entityId}`}>
        {option.isRequired ? (
          <>
            {option.displayName} <span className="font-normal text-gray-500">(required)</span>
          </>
        ) : (
          option.displayName
        )}
      </Label>
      <div className="@md:w-32">
        <Counter
          id={`${option.entityId}`}
          isInteger={option.isIntegerOnly}
          max={Number(option.highest)}
          min={Number(option.lowest)}
          name={field.name}
          onChange={field.onChange}
          value={field.value ? Number(field.value) : ''}
          variant={error && 'error'}
        />
      </div>
      {error && <ErrorMessage>{error.message}</ErrorMessage>}
    </div>
  );
};
