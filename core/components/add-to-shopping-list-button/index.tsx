'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/vibes/soul/primitives/button';
import { type B2BProductOption } from '~/b2b/types';
import { useSDK } from '~/b2b/use-b2b-sdk';

interface Props {
  productEntityId: string;
  sku: string;
  className?: string;
  selectedOptions: B2BProductOption[];
  validate: () => void
  quantity?: number;
}

export const AddToShoppingListButton = ({
  productEntityId,
  sku,
  className,
  selectedOptions,
  validate,
  quantity = 1,
}: Props) => {
  const sdk = useSDK();
  const addProduct = sdk?.utils?.shoppingList?.addProductFromPage;
  const t = useTranslations('Components.AddToShoppingListButton');
  const [loading, setLoading] = useState(false);

  if (!addProduct) {
    return null;
  }

  const handleAddToShoppingList = () => {
    setLoading(true);
    try {
      validate()
      
      const productOptions = Object.values(selectedOptions);

      void addProduct(
        {
          sku,
          productEntityId: Number(productEntityId),
          quantity,
          selectedOptions: productOptions.length > 0 ? productOptions : undefined,
        },
      ).finally(() => setLoading(false));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      className={className}
      loading={loading}
      onClick={handleAddToShoppingList}
      size="medium"
      type="button"
      variant="tertiary"
    >
      {t('addToShoppingList')}
    </Button>
  );
};
