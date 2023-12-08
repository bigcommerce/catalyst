import { DatePicker } from '@bigcommerce/reactant/DatePicker';
import { Label } from '@bigcommerce/reactant/Label';

import { getProduct } from '~/client/queries/getProduct';
import { ExistingResultType, Unpacked } from '~/client/util';

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

  return (
    <>
      <Label className="my-2 inline-block" htmlFor={`${option.entityId}`}>
        {option.isRequired ? (
          <>
            {option.displayName} <span className="font-normal text-gray-500">(required)</span>
          </>
        ) : (
          option.displayName
        )}
      </Label>
      <DatePicker
        defaultValue={option.defaultDate ?? undefined}
        disabledDays={disabledDays}
        id={`${option.entityId}`}
        name={`attribute[${option.entityId}]`}
        required={option.isRequired}
      />
    </>
  );
};
