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
    <Button className="pt-[10px] pb-[5px] bg-white border-solid border-2 border-stone-950 align-middle" loading={pending} loadingText={t('loading')}>      
      <BcImage
        alt="Amazon Pay"
        width={125}
        height={25}
        className="w-[25%] h-[21px]"
        unoptimized={true}
        src={icon}
      />
    </Button>
  );
};

export const AmazonpayButton = ({ cartId, icon }: { cartId: string, icon: string }) => {
  return (
    <form action={redirectToCheckout} className='cart-amazonPayButton'>
      <input name="cartId" type="hidden" value={cartId} />
      <InternalButton icon={icon} />
    </form>
  );
};
