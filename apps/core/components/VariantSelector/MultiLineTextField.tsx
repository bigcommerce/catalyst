import { MultiLineTextFieldOption } from '@bigcommerce/catalyst-client';
import { Label } from '@bigcommerce/reactant/Label';
import { TextArea } from '@bigcommerce/reactant/TextArea';

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
      defaultValue={option.defaultValue ?? undefined}
      maxLength={option.maxLength ?? undefined}
      minLength={option.minLength ?? undefined}
      name={`attribute[${option.entityId}]`}
      required={option.isRequired}
      rows={1}
    />
  </>
);
