import { useTranslations } from 'next-intl';

import { Subscribe as SubscribeSection } from '@/ui/sections/subscribe';

import { subscribe } from './_actions/subscribe';

export const Subscribe = () => {
  const t = useTranslations('Components.Subscribe');

  return (
    <SubscribeSection
      action={subscribe}
      description={t('description')}
      placeholder={t('placeholder')}
      title={t('title')}
    />
  );
};
