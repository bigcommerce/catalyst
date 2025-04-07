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
  validate: () => void;
  quantity?: number;
}

export const AddToQuoteButton = ({
  productEntityId,
  sku,
  className,
  selectedOptions,
  validate,
  quantity = 1,
}: Props) => {
  const t = useTranslations('Components.AddToQuoteButton');
  const [loading, setLoading] = useState(false);

  const addProductsToQuote = useSDK()?.utils?.quote?.addProducts;

  if (!addProductsToQuote) {
    return null;
  }

  const handleAddToQuote = async () => {
    setLoading(true);

    try {
      validate();

      const productOptions = Object.values(selectedOptions);

      await addProductsToQuote([
        {
          sku,
          productEntityId: Number(productEntityId),
          quantity,
          selectedOptions: productOptions.length > 0 ? productOptions : undefined,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      className={className}
      loading={loading}
      onClick={handleAddToQuote}
      size="medium"
      type="button"
      variant="secondary"
    >
      {t('addToQuote')}
    </Button>
  );
};
