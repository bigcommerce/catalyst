'use client';

import { Loader2 as Spinner } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFormStatus } from 'react-dom';

import { Button } from '~/components/ui/button';

export const AddToCart = ({
  disabled = false,
  productName,
}: {
  disabled?: boolean;
  productName: string;
}) => {
  const t = useTranslations('Compare');
  const { pending } = useFormStatus();

  return (
    <Button aria-label={productName} disabled={disabled || pending} type="submit">
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
