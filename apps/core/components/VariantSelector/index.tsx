'use client';

import { Checkbox } from '@bigcommerce/reactant/Checkbox';
import { Counter } from '@bigcommerce/reactant/Counter';
import { Label } from '@bigcommerce/reactant/Label';
import { RadioGroup, RadioItem } from '@bigcommerce/reactant/RadioGroup';
import { RectangleList, RectangleListItem } from '@bigcommerce/reactant/RectangleList';
import { Swatch, SwatchItem } from '@bigcommerce/reactant/Swatch';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Fragment } from 'react';

import client from '~/client';

type Product = Awaited<ReturnType<typeof client.getProduct>>;

export const VariantSelector = ({ product }: { product: NonNullable<Product> }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const hasNoOptions = !product.productOptions || !product.productOptions.length;

  if (hasNoOptions) {
    return null;
  }

  const handleOnValueChange = ({ optionId, valueId }: { optionId: number; valueId: number }) => {
    const optionSearchParams = new URLSearchParams(searchParams.toString());

    optionSearchParams.set(String(optionId), String(valueId));

    router.replace(`${pathname}?${optionSearchParams.toString()}`, { scroll: false });
  };

  return product.productOptions?.map((option) => {
    const previouslySelected = searchParams.get(String(option.entityId)) ?? undefined;

    if (option.__typename === 'MultipleChoiceOption') {
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
                defaultValue={previouslySelected || selectedValue || defaultValue}
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
                defaultValue={previouslySelected || selectedValue || defaultValue}
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
                defaultValue={previouslySelected || selectedValue || defaultValue}
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
                    <Label
                      className="cursor-pointer ps-4 font-normal"
                      htmlFor={`${value.entityId}`}
                    >
                      {value.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </Fragment>
          );

        default:
          return null;
      }
    }

    if (option.__typename === 'CheckboxOption') {
      return (
        <fieldset key={option.entityId}>
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
    }

    if (option.__typename === 'NumberFieldOption') {
      return (
        <Fragment key={option.entityId}>
          <Label className="my-2 inline-block" htmlFor={`${option.entityId}`}>
            {option.displayName}
          </Label>
          <div className="sm:w-[120px]">
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
        </Fragment>
      );
    }

    return null;
  });
};
