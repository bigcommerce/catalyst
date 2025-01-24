'use client';

import { useTranslations } from 'next-intl';
import { useFormStatus } from 'react-dom';
import { BcImage } from '~/components/bc-image';

import { Button } from '~/components/ui/button';

import deleteIcon from '~/public/cart/deleteIcon.svg'

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
      <BcImage
        alt="Remove"
        width={16}
        height={18}
        className="w-[16px] h-[18px]"
        src={deleteIcon}
      />
    </Button>
  );
};
