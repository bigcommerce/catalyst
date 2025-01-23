'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { BcImage } from '~/components/bc-image';

export const StillNeedContactUs = ({icon}:{icon: any}) => {
    const t = useTranslations('Account.Orders');
  return (
    <div className="flex items-center gap-[5px] text-[16px] font-normal leading-[32px] tracking-[0.15px]">
      <div className="mr-[5px] flex items-center">
        <BcImage src={icon} alt="Hand Icon" width={24} height={24} unoptimized={true} className="h-[24px] w-[24px] brightness-0" />
      </div>
      <div>{t('stillNeedHelp')} </div>
      <Link href="#" className="text-base font-semibold text-[#008BB7]">
        {t('contact')}
      </Link>
    </div>
  );
};
