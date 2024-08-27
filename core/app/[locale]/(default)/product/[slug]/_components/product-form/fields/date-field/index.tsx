import { useFormatter } from 'next-intl';

import { FragmentOf } from '~/client/graphql';
import { DatePicker, Label } from '~/components/ui/form';

import { useProductFieldController } from '../../use-product-form';
import { ErrorMessage } from '../shared/error-message';

import { DateFieldFragment } from './fragment';

type Option = FragmentOf<typeof DateFieldFragment>;

const getDisabledDays = (option: Option) => {
  switch (option.limitDateBy) {
    case 'EARLIEST_DATE':
      return option.earliest ? [{ before: new Date(option.earliest) }] : [];

    case 'LATEST_DATE':
      return option.latest ? [{ after: new Date(option.latest) }] : [];

    case 'RANGE':
      return option.earliest && option.latest
        ? [{ before: new Date(option.earliest), after: new Date(option.latest) }]
        : [];

    case 'NO_LIMIT':
    default:
      return [];
  }
};

interface Props {
  option: Option;
}

export const DateField = ({ option }: Props) => {
  const format = useFormatter();

  const disabledDays = getDisabledDays(option);
  const { field, fieldState } = useProductFieldController({
    name: `attribute_${option.entityId}`,
    rules: {
      required: option.isRequired ? 'Please select a date.' : false,
    },
    defaultValue: option.defaultDate ? format.dateTime(new Date(option.defaultDate)) : '',
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
      <DatePicker
        disabledDays={disabledDays}
        error={Boolean(error)}
        id={`${option.entityId}`}
        onSelect={field.onChange}
        selected={field.value ? new Date(field.value) : undefined}
      />
      {error && <ErrorMessage>{error.message}</ErrorMessage>}
    </div>
  );
};
