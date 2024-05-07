import { FragmentOf } from '~/client/graphql';
import { Checkbox } from '~/components/ui/checkbox';
import { Label } from '~/components/ui/label';

import { useProductFieldController } from '../../use-product-form';
import { ErrorMessage } from '../shared/error-message';

import { CheckboxFieldFragment } from './fragment';

interface Props {
  option: FragmentOf<typeof CheckboxFieldFragment>;
}

export const CheckboxField = ({ option }: Props) => {
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
          variant={error ? 'error' : undefined}
        />
        <Label className="mx-3 font-normal" htmlFor={`${option.entityId}`}>
          {option.label}
        </Label>
      </div>
      {error && <ErrorMessage>{error.message}</ErrorMessage>}
    </fieldset>
  );
};
