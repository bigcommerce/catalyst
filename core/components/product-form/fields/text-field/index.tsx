import { FragmentOf } from '~/client/graphql';
import { Input, Label } from '~/components/ui/form';

import { useProductFieldController } from '../../use-product-form';
import { ErrorMessage } from '../shared/error-message';

import { TextFieldFragment } from './fragment';

interface Props {
  option: FragmentOf<typeof TextFieldFragment>;
}

export const TextField = ({ option }: Props) => {
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
      <Label className="mb-2 inline-block font-semibold" htmlFor={`${option.entityId}`}>
        {option.isRequired ? (
          <>
            {option.displayName} <span className="font-normal text-gray-500">(required)</span>
          </>
        ) : (
          option.displayName
        )}
      </Label>
      <Input
        error={Boolean(error)}
        id={`${option.entityId}`}
        name={field.name}
        onChange={field.onChange}
        value={field.value}
      />
      {error && <ErrorMessage>{error.message}</ErrorMessage>}
    </div>
  );
};
