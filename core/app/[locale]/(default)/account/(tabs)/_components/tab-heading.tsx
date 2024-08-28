import { getLocale, getTranslations } from 'next-intl/server';

import { TabType } from '../layout';

export const TabHeading = async ({ heading }: { heading: TabType }) => {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'Account.Home' });

  return <h2 className="mb-8 text-3xl font-black lg:text-4xl">{t(heading)}</h2>;
};
