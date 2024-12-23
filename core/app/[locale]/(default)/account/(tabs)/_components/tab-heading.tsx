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
        className="login-div login-breadcrumb mx-auto mb-[30px] hidden px-[1px] lg:block"
        breadcrumbs={breadcrumbs}
      />

      <h2 className="mb-[30px] text-[24px] font-normal leading-[32px] text-[#353535]">
        {t(heading)}
      </h2>
    </>
  );
};
