'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import client from '~/client';

import { CheckboxField } from './CheckboxField';
import { MultiLineTextField } from './MultiLineTextField';
import { MultipleChoiceField } from './MultipleChoiceField';
import { NumberField } from './NumberField';

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
      return <CheckboxField key={option.entityId} option={option} />;
    }

    if (option.__typename === 'NumberFieldOption') {
      return <NumberField key={option.entityId} option={option} />;
    }

    if (option.__typename === 'MultiLineTextFieldOption') {
      return <MultiLineTextField key={option.entityId} option={option} />;
    }

    return null;
  });
};
