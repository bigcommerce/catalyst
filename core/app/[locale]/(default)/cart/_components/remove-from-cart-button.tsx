'use client';

import { useTranslations } from 'next-intl';
import { useFormStatus } from 'react-dom';

import { Button } from '~/components/ui/button';

export const RemoveFromCartButton = () => {
  const { pending } = useFormStatus();
  const t = useTranslations('Cart.SubmitRemoveItem');

  return (
    <Button
      className="w-auto items-center p-0 text-primary hover:bg-transparent disabled:text-primary disabled:hover:text-primary"
      loading={pending}
      loadingText={t('spinnerText')}
      type="submit"
      variant="subtle"
    >
      {t('remove')}
    </Button>
  );
};
