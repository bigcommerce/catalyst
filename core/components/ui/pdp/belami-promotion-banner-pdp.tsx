// Promotion Placeholder

import React from 'react';
import { useTranslations } from 'next-intl';

const Promotion = () => {
  const t = useTranslations('promotion');

  return (
    <div className="promotional-placeholder bg-[#e7f5f8] p-20 text-center">
      <div className="text-base text-[#03465c]">{t('placeholder')}</div>
    </div>
  );
};

export default Promotion;
