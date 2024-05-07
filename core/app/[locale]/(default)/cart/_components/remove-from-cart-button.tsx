'use client';

import { Loader2 as Spinner, Trash } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFormStatus } from 'react-dom';

export const RemoveFromCartButton = () => {
  const { pending } = useFormStatus();
  const t = useTranslations('Cart.SubmitRemoveItem');

  return (
    <button
      aria-label={t('submitText')}
      className="items-center hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
      disabled={pending}
      type="submit"
    >
      {pending ? (
        <>
          <Spinner aria-hidden="true" className="animate-spin text-primary " />
          <span className="sr-only">{t('spinnerText')}</span>
        </>
      ) : (
        <Trash aria-hidden="true" />
      )}
    </button>
  );
};
