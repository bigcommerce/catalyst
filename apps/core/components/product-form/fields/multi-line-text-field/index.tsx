import { FragmentOf } from '~/client/graphql';
import { Label } from '~/components/ui/label';
import { TextArea } from '~/components/ui/text-area';

import { useProductFieldController } from '../../use-product-form';
import { ErrorMessage } from '../shared/error-message';

import { MultiLineTextFieldFragment } from './fragment';

interface Props {
  option: FragmentOf<typeof MultiLineTextFieldFragment>;
}

export const MultiLineTextField = ({ option }: Props) => {
  const { field, fieldState } = useProductFieldController({
    name: `attribute_${option.entityId}`,
    rules: {
      required: option.isRequired ? 'Please include a message.' : false,
      minLength: option.minLength
        ? {
            value: option.minLength,
            message: `Message must be longer than ${option.minLength} characters.`,
          }
        : undefined,
      maxLength: option.maxLength
        ? {
            value: option.maxLength,
            message: `Message must be shorter than ${option.maxLength} characters.`,
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
      <TextArea
        id={`${option.entityId}`}
        name={field.name}
        onChange={field.onChange}
        rows={option.maxLines ?? 1}
        value={field.value}
        variant={error && 'error'}
      />
      {error && <ErrorMessage>{error.message}</ErrorMessage>}
    </div>
  );
};
