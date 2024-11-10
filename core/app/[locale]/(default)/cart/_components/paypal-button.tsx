'use client';

import { useTranslations } from 'next-intl';
import { useFormStatus } from 'react-dom';
import { BcImage } from '~/components/bc-image';
import { Button } from '~/components/ui/button';

import { redirectToCheckout } from '../_actions/redirect-to-checkout';

const InternalButton = ({ icon }: { icon: string }) => {
  const t = useTranslations('Cart');
  const { pending } = useFormStatus();

  return (
    <Button className="mt-3 bg-slate-100 border-solid border-2 border-black-600 h-[40px]" loading={pending} loadingText={t('loading')}>
      <BcImage
        alt="Paypal"
        width={20}
        height={20}
        className="w-[20px] h-[20px]"
        src={icon}
      />
    </Button>
  );
};

export const PaypalButton = ({ cartId, icon }: { cartId: string, icon: string }) => {
  return (
    <form action={redirectToCheckout} className='cart-paypalButton'>
      <input name="cartId" type="hidden" value={cartId} />
      <InternalButton icon={icon} />
    </form>
  );
};
