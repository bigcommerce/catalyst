'use client';

import { useTranslations } from 'next-intl';

export default function Error() {
  const t = useTranslations('Error');

  return (
    <div className="h-full px-10 py-12 lg:py-24">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-3xl font-black lg:text-5xl">{t('heading')}</h1>
        <p className="text-base">{t('message')}</p>
      </div>
    </div>
  );
}
