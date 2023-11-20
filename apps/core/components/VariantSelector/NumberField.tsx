import { NumberFieldOption } from '@bigcommerce/catalyst-client';
import { Counter } from '@bigcommerce/reactant/Counter';
import { Label } from '@bigcommerce/reactant/Label';

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
        defaultValue={Number(option.defaultValue) || 0}
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
