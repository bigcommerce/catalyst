import React from 'react';
import { useTranslations } from 'next-intl';

export const ShippingReturns: React.FC = () => {
  const t = useTranslations('shippingReturns');

  return (
    <div className="mt-4 xl:mt-7 flex justify-center gap-5 text-center">
      <div className="text-[#008BB7] mb-4 underline">
        <a href="#">{t('shippingPolicy')}</a>
      </div>
      <div className="text-[#008BB7] underline">
        <a href="#">{t('returnPolicy')}</a>
      </div>
    </div>
  );
};
