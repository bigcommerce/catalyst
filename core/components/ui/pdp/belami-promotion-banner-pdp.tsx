// Promotion Placeholder

import React from 'react';
import { useTranslations } from 'next-intl';

const Promotion = () => {
  const t = useTranslations('promotion');

  return (
    <div className="promotional-placeholder mb-8 p-20 text-center bg-[#e7f5f8]">
      <div className="text-[#03465c] text-base">{t('placeholder')}</div>
    </div>
  );
};

export default Promotion;



