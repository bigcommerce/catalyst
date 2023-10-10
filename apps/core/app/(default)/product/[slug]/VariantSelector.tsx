'use client';

import { Label } from '@bigcommerce/reactant/Label';
import { RectangleList, RectangleListItem } from '@bigcommerce/reactant/RectangleList';
import { Swatch, SwatchItem } from '@bigcommerce/reactant/Swatch';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Fragment } from 'react';

import client from '~/client';
import { createUrl } from '~/utils';

type Product = NonNullable<Awaited<ReturnType<typeof client.getProduct>>>;

export const VariantSelector = ({ product }: { product: Product }) => {
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

    const optionUrl = createUrl(pathname, optionSearchParams);

    void router.push(optionUrl, { scroll: false });
  };

  return product.productOptions?.map((option) => {
    if (option.__typename === 'MultipleChoiceOption') {
      switch (option.displayStyle) {
        case 'Swatch':
          return (
            <Fragment key={option.entityId}>
              <Label className="my-2 inline-block font-semibold" id={`label-${option.entityId}`}>
                {option.displayName}
              </Label>
              <Swatch
                aria-labelledby={`label-${option.entityId}`}
                defaultValue={searchParams.get(String(option.entityId)) ?? undefined}
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
              <Label className="my-2 inline-block font-semibold" id={`label-${option.entityId}`}>
                {option.displayName}
              </Label>
              <RectangleList
                aria-labelledby={`label-${option.entityId}`}
                defaultValue={searchParams.get(String(option.entityId)) ?? undefined}
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

        default:
          return null;
      }
    }

    return null;
  });
};
