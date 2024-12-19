import { getTranslations } from 'next-intl/server';

import { TabType } from './tab-navigation';

export const TabHeading = async ({ heading }: { heading: TabType }) => {
  const t = await getTranslations('Account.Home');

  return <h2 className="text-[24px] font-semibold leading-[32px] text-[#353535] mb-[10px]">{t(heading)}</h2>;
};
