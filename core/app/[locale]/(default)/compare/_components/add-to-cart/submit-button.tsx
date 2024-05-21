'use client';

import { useTranslations } from 'next-intl';
import { useFormStatus } from 'react-dom';

import { Button } from '~/components/ui/button';

export const SubmitButton = ({ disabled = false }: { disabled?: boolean }) => {
  const t = useTranslations('Compare');
  const { pending } = useFormStatus();

  return (
    <Button disabled={disabled} loading={pending} loadingText={t('processing')} type="submit">
      {disabled ? t('outOfStock') : t('addToCart')}
    </Button>
  );
};
