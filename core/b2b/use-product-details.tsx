'use client';

import { useState } from 'react';

import { useB2BQuoteEnabled } from '~/b2b/use-b2b-quote-enabled';
import { useSDK } from '~/b2b/use-b2b-sdk';
import { useB2bShoppingListEnabled } from '~/b2b/use-b2b-shopping-list-enabled';

import { Field } from '../vibes/soul/sections/product-detail/schema';

import { mapToB2BProductOptions } from './map-to-b2b-product-options';

interface ProductOption {
  field: Field;
  value?: string | number;
}

interface Data {
  productId: string;
  quantity: number;
  selectedOptions: ProductOption[];
}

export const useAddToQuote = () => {
  const isQuotesEnabled = useB2BQuoteEnabled();
  const [isAddingToQuote, setLoading] = useState(false);
  const sdk = useSDK();

  const addProductsToQuote = async ({ selectedOptions, productId, quantity }: Data) => {
    setLoading(true);

    try {
      await sdk?.utils?.quote?.addProducts([
        {
          productEntityId: Number(productId),
          quantity,
          selectedOptions: selectedOptions.map(mapToB2BProductOptions),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return {
    isQuotesEnabled,
    isAddingToQuote,
    addProductsToQuote,
  };
};

export const useAddToShoppingList = () => {
  const isShoppingListEnabled = useB2bShoppingListEnabled();
  const [isAddingToShoppingList, setLoading] = useState(false);
  const sdk = useSDK();

  const addProductToShoppingList = async ({ selectedOptions, productId, quantity }: Data) => {
    setLoading(true);

    try {
      await sdk?.utils?.shoppingList?.addProductFromPage({
        productEntityId: Number(productId),
        quantity,
        selectedOptions: selectedOptions.map(mapToB2BProductOptions),
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    isShoppingListEnabled,
    isAddingToShoppingList,
    addProductToShoppingList,
  };
};
