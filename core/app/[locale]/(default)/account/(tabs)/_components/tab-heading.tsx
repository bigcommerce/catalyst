import { useTranslations } from 'next-intl';

import { TabType } from '../layout';

export const TabHeading = ({ heading }: { heading: TabType }) => {
  const t = useTranslations('Account.Home');

  return <h2 className="mb-8 text-3xl font-black lg:text-4xl">{t(heading)}</h2>;
};
