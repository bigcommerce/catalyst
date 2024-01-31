'use client';

import { Button } from '@bigcommerce/components/button';
import { ShoppingCart, Loader2 as Spinner } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

export const AddToCart = ({ disabled = false }: { disabled?: boolean }) => {
  const { formState } = useFormContext();
  const { isSubmitting } = formState;

  const t = useTranslations('Product.Form');

  return (
    <Button disabled={disabled || isSubmitting} type="submit">
      {isSubmitting ? (
        <>
          <Spinner aria-hidden="true" className="animate-spin" />
          <span className="sr-only">{t('processing')}</span>
        </>
      ) : (
        <>
          <ShoppingCart aria-hidden="true" className="mx-2" />
          <span>{t('addToCart')}</span>
        </>
      )}
    </Button>
  );
};
