import { getTranslations } from 'next-intl/server';

import { TabType } from './tab-navigation';
import { Breadcrumbs as ComponentsBreadcrumbs } from '~/components/ui/breadcrumbs';

const breadcrumbs: any = [
  {
    label: 'Favorites and Lists',
    href: '#',
  },
];

export const TabHeading = async ({ heading }: { heading: TabType }) => {
  const t = await getTranslations('Account.Home');

  return (
    <>
      <ComponentsBreadcrumbs
        className="login-div login-breadcrumb mx-auto mb-[20px] flex justify-center px-[1px] lg:block xl:mb-[30px] xl:justify-start"
        breadcrumbs={breadcrumbs}
      />

      <h2 className="mb-[20px] text-center text-[24px] font-normal leading-[32px] text-[#353535] xl:mb-[30px] xl:text-left">
        {t(heading)}
      </h2>
    </>
  );
};
