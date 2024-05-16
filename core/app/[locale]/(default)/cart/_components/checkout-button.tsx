'use client';

import { useTranslations } from 'next-intl';
import { useFormStatus } from 'react-dom';

import { Button } from '~/components/ui/button';

import { redirectToCheckout } from '../_actions/redirect-to-checkout';

const InternalButton = () => {
  const t = useTranslations('Cart');
  const { pending } = useFormStatus();

  return (
    <Button className="mt-6" loading={pending} loadingText={t('loading')}>
      {t('proceedToCheckout')}
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
