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
        className="login-div login-breadcrumb mx-auto mb-[20px] xl:mb-[30px] px-[1px] flex lg:block justify-center xl:justify-start"
        breadcrumbs={breadcrumbs}
      />

      <h2 className=" text-[24px] font-normal leading-[32px] text-[#353535] mb-[20px] xl:mb-[30px] text-center xl:text-left">
        {t(heading)}
      </h2>
    </>
  );
};
