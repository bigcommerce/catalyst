import { FragmentOf } from '~/client/graphql';
import { Counter } from '~/components/ui/counter';
import { Label } from '~/components/ui/label';

import { useProductFieldController } from '../../use-product-form';
import { ErrorMessage } from '../shared/error-message';

import { NumberFieldFragment } from './fragment';

interface Props {
  option: FragmentOf<typeof NumberFieldFragment>;
}

export const NumberField = ({ option }: Props) => {
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
