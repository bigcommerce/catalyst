import { DatePicker } from '@bigcommerce/components/DatePicker';
import { Label } from '@bigcommerce/components/Label';

import { getProduct } from '~/client/queries/get-product';
import { ExistingResultType, Unpacked } from '~/client/util';

import { useProductFieldController } from '../use-product-form';

import { ErrorMessage } from './shared/error-message';

type DateFieldOption = Extract<
  Unpacked<ExistingResultType<typeof getProduct>['productOptions']>,
  { __typename: 'DateFieldOption' }
>;

const getDisabledDays = (option: DateFieldOption) => {
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

export const DateField = ({ option }: { option: DateFieldOption }) => {
  const disabledDays = getDisabledDays(option);
  const { field, fieldState } = useProductFieldController({
    name: `attribute_${option.entityId}`,
    rules: {
      required: option.isRequired ? 'Please select a date.' : false,
    },
    defaultValue: option.defaultDate
      ? Intl.DateTimeFormat().format(new Date(option.defaultDate))
      : '',
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
      <DatePicker
        disabledDays={disabledDays}
        id={`${option.entityId}`}
        onSelect={field.onChange}
        selected={field.value ? new Date(field.value) : undefined}
        variant={error && 'error'}
      />
      {error && <ErrorMessage>{error.message}</ErrorMessage>}
    </div>
  );
};
