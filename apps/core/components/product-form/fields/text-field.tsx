import { Input } from '@bigcommerce/components/Input';
import { Label } from '@bigcommerce/components/Label';

import { getProduct } from '~/client/queries/get-product';
import { ExistingResultType, Unpacked } from '~/client/util';

import { useProductFieldController } from '../use-product-form';

import { ErrorMessage } from './shared/error-message';

type TextFieldOption = Extract<
  Unpacked<ExistingResultType<typeof getProduct>['productOptions']>,
  { __typename: 'TextFieldOption' }
>;

export const TextField = ({ option }: { option: TextFieldOption }) => {
  const { field, fieldState } = useProductFieldController({
    name: `attribute_${option.entityId}`,
    rules: {
      required: option.isRequired ? 'Please include a text.' : false,
      minLength: option.minLength
        ? {
            value: option.minLength,
            message: `Text must be longer than ${option.minLength} characters.`,
          }
        : undefined,
      maxLength: option.maxLength
        ? {
            value: option.maxLength,
            message: `Text must be shorter than ${option.maxLength} characters.`,
          }
        : undefined,
    },
    defaultValue: option.defaultText ?? '',
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
      <Input
        id={`${option.entityId}`}
        name={field.name}
        onChange={field.onChange}
        value={field.value}
        variant={error && 'error'}
      />
      {error && <ErrorMessage>{error.message}</ErrorMessage>}
    </div>
  );
};
