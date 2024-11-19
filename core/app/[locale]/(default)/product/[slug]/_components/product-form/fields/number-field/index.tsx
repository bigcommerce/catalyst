import { FragmentOf } from '~/client/graphql';
import { Counter, Label } from '~/components/ui/form';

import { useProductFieldController } from '../../use-product-form';
import { ErrorMessage } from '../shared/error-message';

import { NumberFieldFragment } from './fragment';

interface Props {
  option: FragmentOf<typeof NumberFieldFragment>;
}

export const NumberField = ({ option }: Props) => {
  const min = option.lowest !== null ? Number(option.lowest) : undefined;
  const max = option.highest !== null ? Number(option.highest) : undefined;

  const { field, fieldState } = useProductFieldController({
    name: `attribute_${option.entityId}`,
    rules: {
      required: option.isRequired ? 'Please enter a number.' : false,
      min: min
        ? {
            value: min,
            message: `Number must be equal or higher than ${min}.`,
          }
        : undefined,
      max: max
        ? {
            value: max,
            message: `Number must be equal or lower than ${max}.`,
          }
        : undefined,
    },
    defaultValue: option.defaultNumber ?? '',
  });
  const { error } = fieldState;

  return (
    <div>
      <Label className="mb-2 inline-block font-semibold" htmlFor={`${option.entityId}`}>
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
          error={Boolean(error)}
          id={`${option.entityId}`}
          isInteger={option.isIntegerOnly}
          max={max}
          min={min}
          name={field.name}
          onChange={field.onChange}
          value={field.value === '' ? '' : Number(field.value)}
        />
      </div>
      {error && <ErrorMessage>{error.message}</ErrorMessage>}
    </div>
  );
};
