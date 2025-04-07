'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/vibes/soul/primitives/button';
import { useSDK } from '~/b2b/use-b2b-sdk';

interface Props {
  cartId: string;
  className?: string;
}

export const AddCartToQuoteButton = ({ cartId, className }: Props) => {
  const sdk = useSDK();
  const addProductsFromCartId = sdk?.utils?.quote?.addProductsFromCartId;
  const t = useTranslations('Components.AddToQuoteButton');
  const [loading, setLoading] = useState(false);

  if (!addProductsFromCartId) {
    return null;
  }

  const handleAddCartToQuote = () => {
    setLoading(true);

    try {
      void addProductsFromCartId(cartId).finally(() => setLoading(false));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      className={className}
      loading={loading}
      onClick={handleAddCartToQuote}
      size="medium"
      type="button"
      variant="secondary"
    >
      {t('addCartToQuote')}
    </Button>
  );
};
