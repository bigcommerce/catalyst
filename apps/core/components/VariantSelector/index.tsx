'use client';

import { Checkbox } from '@bigcommerce/reactant/Checkbox';
import { Counter } from '@bigcommerce/reactant/Counter';
import { Label } from '@bigcommerce/reactant/Label';
import { TextArea } from '@bigcommerce/reactant/TextArea';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Fragment } from 'react';

import { getProduct } from '~/client/queries/getProduct';

import { MultipleChoiceField } from './MultipleChoiceField';

type Product = Awaited<ReturnType<typeof getProduct>>;

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
    if (option.__typename === 'MultipleChoiceOption') {
      return (
        <MultipleChoiceField
          handleOnValueChange={handleOnValueChange}
          key={option.entityId}
          option={option}
          searchParamSelected={searchParams.get(String(option.entityId)) ?? undefined}
        />
      );
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
        </Fragment>
      );
    }

    if (option.__typename === 'MultiLineTextFieldOption') {
      return (
        <Fragment key={option.entityId}>
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
            maxLength={option.maxLength ?? undefined}
            minLength={option.minLength ?? undefined}
            name={`attribute[${option.entityId}]`}
            required={option.isRequired}
            rows={1}
          />
        </Fragment>
      );
    }

    return null;
  });
};
