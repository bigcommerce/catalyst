import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { TabHeading } from '../_components/tab-heading';

import { UpdateSettingsForm } from './_components/update-settings-form';
import { getCustomerSettingsQuery } from './page-data';
import { Breadcrumbs as ComponentsBreadcrumbs } from '~/components/ui/breadcrumbs';
const breadcrumbs: any = [
  {
    label: 'Account Details',
    href: '#',
  },
];

export async function generateMetadata() {
  const t = await getTranslations('Account.Settings');

  return {
    title: t('title'),
  };
}

export default async function Settings() {
  const customerSettings = await getCustomerSettingsQuery({
    address: { filters: { entityIds: [4, 5, 6, 7] } },
  });
  if (!customerSettings) {
    notFound();
  }

  return (
    <>
      <div className="mx-auto mb-8 lg:w-2/3">
        <ComponentsBreadcrumbs
          className="login-div login-breadcrumb mx-auto mb-[20px] flex justify-center px-[1px] lg:block lg-text-left xl:mb-[30px] xl:text-left"
          breadcrumbs={breadcrumbs}
        />
        <h2 className="mb-[20px] text-center text-[24px] font-normal leading-[32px] lg:text-left text-[#353535] xl:mb-[30px] lg-text-left xl:text-left">
          {'Account Details'}
        </h2>
      </div>
      <div className="mx-auto px-5 lg:px-0 lg:w-2/3">
        <UpdateSettingsForm {...customerSettings} showFeilds={false} />
      </div>
    </>
  );
}

export const runtime = 'edge';
