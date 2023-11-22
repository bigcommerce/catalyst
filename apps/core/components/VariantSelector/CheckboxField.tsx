import { Checkbox } from '@bigcommerce/reactant/Checkbox';
import { Label } from '@bigcommerce/reactant/Label';

import { getProduct } from '~/client/queries/getProduct';
import { ExistingResultType, Unpacked } from '~/client/util';

type CheckboxOption = Extract<
  Unpacked<ExistingResultType<typeof getProduct>['productOptions']>,
  { __typename: 'CheckboxOption' }
>;

export const CheckboxField = ({ option }: { option: CheckboxOption }) => (
  <fieldset>
    <legend className="inline-block py-2 font-semibold">
      {option.isRequired ? (
        <>
          {option.displayName} <span className="font-normal text-gray-500">(required)</span>
        </>
      ) : (
        option.displayName
      )}
    </legend>
    <div className="flex flex-row items-center" key={option.entityId}>
      <Checkbox
        defaultChecked={option.checkedByDefault}
        id={`${option.entityId}`}
        name={`attribute[${option.entityId}]`}
        required={option.isRequired}
        value={option.checkedOptionValueEntityId}
      />
      <Label className="mx-3 font-normal" htmlFor={`${option.entityId}`}>
        {option.label}
      </Label>
    </div>
  </fieldset>
);
