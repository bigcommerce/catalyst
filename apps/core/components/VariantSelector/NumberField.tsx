import { Counter } from 'components/_reactant/components/Counter';
import { Label } from 'components/_reactant/components/Label';

import { getProduct } from '~/clients/new/queries/getProduct';
import { ExistingResultType, Unpacked } from '~/clients/new/util';

type NumberFieldOption = Extract<
  Unpacked<ExistingResultType<typeof getProduct>['productOptions']>,
  { __typename: 'NumberFieldOption' }
>;

export const NumberField = ({ option }: { option: NumberFieldOption }) => (
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
    <div className="sm:w-32">
      <Counter
        defaultValue={Number(option.defaultNumber) || 0}
        id={`${option.entityId}`}
        isInteger={option.isIntegerOnly}
        max={Number(option.highest)}
        min={Number(option.lowest)}
        name={`attribute[${option.entityId}]`}
        required={option.isRequired}
      />
    </div>
  </>
);
