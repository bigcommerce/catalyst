'use client';

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
    <Button
      aria-label={productName}
      disabled={disabled}
      loading={pending}
      loadingText={t('processing')}
      type="submit"
    >
      {t('addToCart')}
    </Button>
  );
};
