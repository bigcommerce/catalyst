'use client';

import { useTranslations } from 'next-intl';
import { useFormStatus } from 'react-dom';
import { BcImage } from '~/components/bc-image';

import { Button } from '~/components/ui/button';
interface Props {
  icon: string
}
export const RemoveFromCartButton = ({icon}: Props) => {
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
        width={20}
        height={20}
        className="w-[16px] h-[18px]"
        src={icon}
      />
    </Button>
  );
};
