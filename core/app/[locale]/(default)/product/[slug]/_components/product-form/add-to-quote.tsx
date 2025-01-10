'use client';

import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { FragmentOf } from '~/client/graphql';
import { Button } from '~/components/ui/button';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { getValues, trigger } = useFormContext();

  const handleClick = async () => {
    setIsSubmitting(true);

    // Trigger validation for all fields
    const isValidForm = await trigger();

    if (!isValidForm) {
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      return;
    }

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

    // eslint-disable-next-line valid-jsdoc
    /**
     * @todo instead of retrying, should we just call the B2B API directly?
     *
     * fetch("https://api-b2b.bigcommerce.com/graphql", {
     *   headers: {
     *     "content-type": "application/json",
     *     "authorization": "..."
     *   },
     *   body: JSON.stringify({
     *     query: `{
     *       productsSearch(
     *         search: ""
     *         productIds: [111]
     *         currencyCode: "USD"
     *         companyId: "7228189"
     *         storeHash: "cngr5fkoc"
     *         channelId: 1682982
     *         customerGroupId: 0
     *       ) {
     *         id
     *         name
     *         sku
     *         costPrice
     *         inventoryLevel
     *         inventoryTracking
     *         availability
     *         orderQuantityMinimum
     *         orderQuantityMaximum
     *         variants
     *         currencyCode
     *         imageUrl
     *         modifiers
     *         options
     *         optionsV3
     *         channelId
     *         productUrl
     *         taxClassId
     *         isPriceHidden
     *       }
     *     }`
     *   }),
     *   method: "POST"
     * });
     */
    const tryAddToQuote = async (retryCount = 0, maxRetries = 10) => {
      // @todo should we always assume that the quote utils are available?
      if (window.b2b?.utils.quote?.addProducts) {
        await window.b2b.utils.quote.addProducts([transformedProduct]);

        setIsSubmitting(false);

        return;
      }

      if (retryCount < maxRetries) {
        setTimeout(() => {
          void tryAddToQuote(retryCount + 1);
        }, 500); // Retry every 500ms
      } else {
        console.error('Failed to add to quote: b2b quote utils not available');
        setIsSubmitting(false);
      }
    };

    void tryAddToQuote();
  };

  return (
    <Button
      disabled={isSubmitting}
      loading={isSubmitting}
      onClick={handleClick}
      type="button"
      variant="secondary"
    >
      Add to Quote
    </Button>
  );
}
