import { Label } from '@bigcommerce/reactant/Label';
import { TextArea } from '@bigcommerce/reactant/TextArea';

import { getProduct } from '~/client/queries/getProduct';
import { ExistingResultType, Unpacked } from '~/client/util';

type MultiLineTextFieldOption = Extract<
  Unpacked<ExistingResultType<typeof getProduct>['productOptions']>,
  { __typename: 'MultiLineTextFieldOption' }
>;

export const MultiLineTextField = ({ option }: { option: MultiLineTextFieldOption }) => (
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
    <TextArea
      defaultValue={option.defaultText ?? undefined}
      id={`${option.entityId}`}
      maxLength={option.maxLength ?? undefined}
      minLength={option.minLength ?? undefined}
      name={`attribute[${option.entityId}]`}
      required={option.isRequired}
      rows={1}
    />
  </>
);
