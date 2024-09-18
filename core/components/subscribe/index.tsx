import { useTranslations } from 'next-intl';

import { Subscribe as SubscribeComponent } from '../vibes/subscribe';

export const Subscribe = () => {
  const t = useTranslations('Components.Subscribe');

  return (
    <SubscribeComponent
      description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor."
      title={t('title')}
    />
  );
};
