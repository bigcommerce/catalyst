import { Loader2 as Spinner } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFormStatus } from 'react-dom';

import { Button } from '~/components/ui/button';

export const SubmitButton = () => {
  const t = useTranslations('Cart.SubmitShippingCost');
  const { pending } = useFormStatus();

  return (
    <Button className="w-full items-center px-8 py-2" disabled={pending} variant="secondary">
      {pending ? (
        <>
          <Spinner aria-hidden="true" className="animate-spin" />
          <span className="sr-only">{t('spinnerText')}</span>
        </>
      ) : (
        <span>{t('submitText')}</span>
      )}
    </Button>
  );
};
