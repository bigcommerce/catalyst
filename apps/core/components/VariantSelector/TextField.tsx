import { Input } from 'components/_reactant/components/Input';
import { Label } from 'components/_reactant/components/Label';

import { getProduct } from '~/clients/new/queries/getProduct';
import { ExistingResultType, Unpacked } from '~/clients/new/util';

type TextFieldOption = Extract<
  Unpacked<ExistingResultType<typeof getProduct>['productOptions']>,
  { __typename: 'TextFieldOption' }
>;

export const TextField = ({ option }: { option: TextFieldOption }) => (
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
    <Input
      defaultValue={option.defaultText ?? undefined}
      id={`${option.entityId}`}
      maxLength={option.maxLength ?? undefined}
      minLength={option.minLength ?? undefined}
      name={`attribute[${option.entityId}]`}
      required={option.isRequired}
    />
  </>
);
