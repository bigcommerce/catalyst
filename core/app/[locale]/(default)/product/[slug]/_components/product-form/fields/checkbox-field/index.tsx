import { FragmentOf } from '~/client/graphql';
import { Checkbox, Label } from '~/components/ui/form';

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
          error={Boolean(error)}
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
        <Label className="mx-3" htmlFor={`${option.entityId}`}>
          {option.label}
        </Label>
      </div>
      {error && <ErrorMessage>{error.message}</ErrorMessage>}
    </fieldset>
  );
};
