import { getTranslations } from 'next-intl/server';

import { TabType } from '../layout';

export const TabHeading = async ({
  heading,
  locale,
}: {
  heading: TabType | 'change-password';
  locale: string;
}) => {
  const t = await getTranslations({ locale, namespace: 'Account.Home' });
  const tab = heading === 'recently-viewed' ? 'recentlyViewed' : heading;
  const title = tab === 'change-password' ? 'changePassword' : tab;

  return <h2 className="mb-8 text-3xl font-black lg:text-4xl">{t(title)}</h2>;
};
