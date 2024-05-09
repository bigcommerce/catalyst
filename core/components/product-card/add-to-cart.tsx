'use client';

import { Loader2 as Spinner } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFormStatus } from 'react-dom';

import { Button } from '~/components/ui/button';

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
