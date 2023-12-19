'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { getProduct } from '~/client/queries/getProduct';
import { ExistingResultType } from '~/client/util';

import { CheckboxField } from './CheckboxField';
import { DateField } from './DateField';
import { MultiLineTextField } from './MultiLineTextField';
import { MultipleChoiceField } from './MultipleChoiceField';
import { NumberField } from './NumberField';
import { TextField } from './TextField';

type Product = ExistingResultType<typeof getProduct>;

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

    if (option.__typename === 'TextFieldOption') {
      return <TextField key={option.entityId} option={option} />;
    }

    if (option.__typename === 'DateFieldOption') {
      return <DateField key={option.entityId} option={option} />;
    }

    return null;
  });
};
