'use client';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useEffect } from 'react';

export const EmptyCart = () => {
  const t = useTranslations('Cart');

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.cookie = 'ztcpn_data=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      document.cookie = 'pr_flr_data=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
  }, [])

  return (
    <div className="h-[400px] xl:h-[85vh] flex justify-center items-center">
      <div className="flex flex-col gap-5 p-10 sm:p-0">
        <h2 className="text-center font-normal text-[24px] leading-[32px] xl:text-[34px] xl:leading-[46px] tracking-[0.25px] text-[#B4B4B5]">{t('empty')}</h2>
        <Link href='/' className='hover:underline text-[#008BB7] hover:text-[#008BB7]/80'><p className="text-center font-medium text-[20px] leading-[32px] tracking-[0.15px]">{t('emptyDetails')}</p></Link>
      </div>
    </div>
  );
};
