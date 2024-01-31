'use client';

import { Button } from '@bigcommerce/components/button';
import { Loader2 as Spinner } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFormStatus } from 'react-dom';

export const AddToCart = ({ disabled = false }: { disabled?: boolean }) => {
  const { pending } = useFormStatus();
  const t = useTranslations('Product.ProductSheet');

  return (
    <Button className="mt-2" disabled={disabled || pending} type="submit">
      {pending ? (
        <>
          <Spinner aria-hidden="true" className="animate-spin" />
          <span className="sr-only">{t('processing')}</span>
        </>
      ) : (
        t('addToCart')
      )}
    </Button>
  );
};
