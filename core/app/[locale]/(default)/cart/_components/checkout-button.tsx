'use client';

import { Loader2 as Spinner } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFormStatus } from 'react-dom';

import { Button } from '~/components/ui/button';

import { redirectToCheckout } from '../_actions/redirect-to-checkout';

const InternalButton = () => {
  const t = useTranslations('Cart');
  const { pending } = useFormStatus();

  return (
    <Button className="mt-6" disabled={pending}>
      {pending ? (
        <>
          <Spinner aria-hidden="true" className="animate-spin text-primary " />
          <span className="sr-only">{t('loading')}</span>
        </>
      ) : (
        t('proceedToCheckout')
      )}
    </Button>
  );
};

export const CheckoutButton = ({ cartId }: { cartId: string }) => {
  return (
    <form action={redirectToCheckout}>
      <input name="cartId" type="hidden" value={cartId} />
      <InternalButton />
    </form>
  );
};
