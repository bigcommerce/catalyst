'use client';

import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { useFormContext } from 'react-hook-form';

import { FragmentOf } from '~/client/graphql';

import { ProductFormFragment } from './fragment';

interface Props {
  product: FragmentOf<typeof ProductFormFragment>;
}

interface ProductOption {
  optionEntityId: number;
  optionValueEntityId: number;
  entityId: number;
  valueEntityId: number;
  text: string;
  number: number;
  date: {
    utc: string;
  };
}

export function AddToQuote({ product }: Props) {
  const { getValues } = useFormContext();

  const handleClick = () => {
    const formData = getValues();

    const productEntityId = Number(formData.product_id);
    const quantity = Number(formData.quantity);

    const selectedOptions = removeEdgesAndNodes(product.productOptions).reduce<ProductOption[]>(
      (accum, option) => {
        const optionValueEntityId = String(formData[`attribute_${option.entityId}`]);

        // Skip empty strings since option is empty
        if (optionValueEntityId === '') return accum;

        // Create base option object that matches ProductOption interface
        const baseOption: ProductOption = {
          optionEntityId: option.entityId,
          entityId: option.entityId,
          optionValueEntityId: 0,
          valueEntityId: 0,
          text: '',
          number: 0,
          date: { utc: new Date().toISOString() },
        };

        switch (option.__typename) {
          case 'MultipleChoiceOption': {
            const valueId = Number(optionValueEntityId);

            return [
              ...accum,
              {
                ...baseOption,
                optionValueEntityId: valueId,
                valueEntityId: valueId,
                text: '',
                number: 0,
                date: { utc: new Date().toISOString() },
              },
            ];
          }

          case 'CheckboxOption': {
            const valueId =
              Number(optionValueEntityId) !== 0
                ? option.checkedOptionValueEntityId
                : option.uncheckedOptionValueEntityId;

            return [
              ...accum,
              {
                ...baseOption,
                optionValueEntityId: valueId,
                valueEntityId: valueId,
                text: '',
                number: 0,
                date: { utc: new Date().toISOString() },
              },
            ];
          }

          default:
            return accum;
        }
      },
      [],
    );

    const transformedProduct = {
      productEntityId,
      quantity,
      selectedOptions,
      sku: product.sku,
    };

    // @todo should we always assume that the quote utils are available?
    const tryAddToQuote = (retryCount = 0, maxRetries = 10) => {
      if (window.b2b?.utils.quote?.addProducts) {
        window.b2b.utils.quote.addProducts([transformedProduct]);

        return;
      }

      if (retryCount < maxRetries) {
        setTimeout(() => {
          tryAddToQuote(retryCount + 1);
        }, 500); // Retry every 500ms
      } else {
        console.error('Failed to add to quote: b2b quote utils not available');
      }
    };

    tryAddToQuote();
  };

  return (
    <button className="rounded border px-4 py-2 text-sm" onClick={handleClick} type="button">
      Add to Quote
    </button>
  );
}
