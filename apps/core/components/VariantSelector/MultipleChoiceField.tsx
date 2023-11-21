import { CatalogProductOptionValue, MultipleChoiceOption } from '@bigcommerce/catalyst-client';
import { Label } from '@bigcommerce/reactant/Label';
import { RadioGroup, RadioItem } from '@bigcommerce/reactant/RadioGroup';
import { RectangleList, RectangleListItem } from '@bigcommerce/reactant/RectangleList';
import { Select, SelectContent, SelectItem } from '@bigcommerce/reactant/Select';
import { Swatch, SwatchItem } from '@bigcommerce/reactant/Swatch';
import { Fragment } from 'react';

interface MultipleChoice extends Omit<MultipleChoiceOption, 'values'> {
  values: CatalogProductOptionValue[];
}

export const MultipleChoiceField = ({
  option,
  searchParamSelected,
  handleOnValueChange,
}: {
  option: MultipleChoice;
  searchParamSelected?: string;
  handleOnValueChange: ({ optionId, valueId }: { optionId: number; valueId: number }) => void;
}) => {
  const selectedValue = option.values.find((value) => value.isSelected)?.entityId.toString();
  const defaultValue = option.values.find((value) => value.isDefault)?.entityId.toString();

  switch (option.displayStyle) {
    case 'Swatch':
      return (
        <Fragment key={option.entityId}>
          <Label className="my-2 inline-block" id={`label-${option.entityId}`}>
            {option.displayName}
          </Label>
          <Swatch
            aria-labelledby={`label-${option.entityId}`}
            defaultValue={searchParamSelected || selectedValue || defaultValue}
            name={`attribute[${option.entityId}]`}
            onValueChange={(value) =>
              handleOnValueChange({
                optionId: option.entityId,
                valueId: Number(value),
              })
            }
            required={option.isRequired}
          >
            {option.values.map((value) => {
              if (value.__typename === 'SwatchOptionValue') {
                return (
                  <SwatchItem
                    key={value.entityId}
                    title={`${option.displayName} ${value.label}`}
                    value={String(value.entityId)}
                    variantColor={value.hexColors[0]}
                  />
                );
              }

              return null;
            })}
          </Swatch>
        </Fragment>
      );

    case 'RectangleBoxes':
      return (
        <Fragment key={option.entityId}>
          <Label className="my-2 inline-block" id={`label-${option.entityId}`}>
            {option.displayName}
          </Label>
          <RectangleList
            aria-labelledby={`label-${option.entityId}`}
            defaultValue={searchParamSelected || selectedValue || defaultValue}
            name={`attribute[${option.entityId}]`}
            onValueChange={(value) =>
              handleOnValueChange({
                optionId: option.entityId,
                valueId: Number(value),
              })
            }
            required={option.isRequired}
          >
            {option.values.map((value) => {
              return (
                <RectangleListItem
                  key={value.entityId}
                  title={`${option.displayName} ${value.label}`}
                  value={String(value.entityId)}
                >
                  {value.label}
                </RectangleListItem>
              );
            })}
          </RectangleList>
        </Fragment>
      );

    case 'RadioButtons':
      return (
        <Fragment key={option.entityId}>
          <Label className="my-2 inline-block font-semibold" id={`label-${option.entityId}`}>
            {option.displayName}
          </Label>
          <RadioGroup
            aria-labelledby={`label-${option.entityId}`}
            defaultValue={searchParamSelected || selectedValue || defaultValue}
            name={`attribute[${option.entityId}]`}
            onValueChange={(value) =>
              handleOnValueChange({
                optionId: option.entityId,
                valueId: Number(value),
              })
            }
            required={option.isRequired}
          >
            {option.values.map((value) => (
              <div className="mb-2 flex" key={value.entityId}>
                <RadioItem id={`${value.entityId}`} value={`${value.entityId}`} />
                <Label className="cursor-pointer ps-4 font-normal" htmlFor={`${value.entityId}`}>
                  {value.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </Fragment>
      );

    case 'DropdownList':
      return (
        <Fragment key={option.entityId}>
          <Label className="my-2 inline-block font-semibold" id={`label-${option.entityId}`}>
            {option.displayName}
          </Label>
          <Select
            aria-labelledby={`label-${option.entityId}`}
            defaultValue={searchParamSelected || selectedValue || defaultValue}
            name={`attribute[${option.entityId}]`}
            onValueChange={(value) =>
              handleOnValueChange({
                optionId: option.entityId,
                valueId: Number(value),
              })
            }
            required={option.isRequired}
          >
            <SelectContent>
              {option.values.map((value) => (
                <SelectItem key={value.entityId} value={`${value.entityId}`}>
                  {value.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Fragment>
      );

    default:
      return null;
  }
};
