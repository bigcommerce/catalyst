'use client';

import { useTranslations } from 'next-intl';
import { useFormStatus } from 'react-dom';

import { Button } from '~/components/ui/button';

import { redirectToCheckout } from '../_actions/redirect-to-checkout';

const InternalButton = () => {
  const t = useTranslations('Cart');
  const { pending } = useFormStatus();

  return (
    <Button className="mt-6 lg:hidden font-medium bg-[#008BB7]" loading={pending} loadingText={t('loading')}>      
      CONTINUE TO CHECKOUT
    </Button>
  );
};

export const ContinuetocheckoutButton = ({ cartId }: { cartId: string }) => {
  return (
    <form action={redirectToCheckout}>
      <input name="cartId" type="hidden" value={cartId} />
      <InternalButton />
    </form>
  );
};
