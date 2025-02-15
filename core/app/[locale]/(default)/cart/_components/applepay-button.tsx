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
    <Button className="mt-6 bg-black" loading={pending} loadingText={t('loading')}>      
      <BcImage
        alt="Apple Pay"
        width={60}
        height={25}
        className="w-[45px] h-[20px]"
        unoptimized={true}
        src={icon}
      />
    </Button>
  );
};

export const ApplepayButton = ({ cartId, icon }: { cartId: string, icon: string }) => {
  return (
    <form action={redirectToCheckout} className='cart-applePay-button'>
      <input name="cartId" type="hidden" value={cartId} />
      <InternalButton icon={icon} />
    </form>
  );
};
