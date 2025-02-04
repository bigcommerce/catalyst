'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { Button } from '@/vibes/soul/primitives/button';
import { type B2BProductOption } from '~/b2b/types';

interface Props {
  productEntityId: string;
  sku: string;
  className?: string;
  selectedOptions: B2BProductOption[];
  quantity?: number;
}

export const AddToQuoteButton = ({
  productEntityId,
  sku,
  className,
  selectedOptions,
  quantity = 1,
}: Props) => {
  const [isB2BEnabled, setIsB2BEnabled] = useState(false);
  const t = useTranslations('Components.AddToQuoteButton');

  useEffect(() => {
    setIsB2BEnabled(typeof window !== 'undefined' && !!window.b2b?.utils?.quote?.addProducts);
  }, []);

  if (!isB2BEnabled) {
    return null;
  }

  const handleAddToQuote = () => {
    if (!window.b2b?.utils?.quote?.addProducts) return;

    const productOptions = Object.values(selectedOptions);

    window.b2b.utils.quote.addProducts([
      {
        sku,
        productEntityId: Number(productEntityId),
        quantity,
        selectedOptions: productOptions.length > 0 ? productOptions : undefined,
      },
    ]);
  };

  return (
    <Button className={className} onClick={handleAddToQuote} type="button" variant="secondary">
      {t('addToQuote')}
    </Button>
  );
};
