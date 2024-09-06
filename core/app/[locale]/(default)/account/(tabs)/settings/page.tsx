import { notFound } from 'next/navigation';

import { TabHeading } from '../_components/tab-heading';

import { SettingsContent } from './_components/settings-content';
import { getCustomerSettingsQuery } from './page-data';

interface Props {
  searchParams: {
    [key: string]: string | string[] | undefined;
    action?: 'change_password';
    before?: string;
    after?: string;
  };
}

export default async function Settings({ searchParams }: Props) {
  const customerSettings = await getCustomerSettingsQuery({
    address: { filters: { entityIds: [4, 5, 6, 7] } },
  });

  if (!customerSettings) {
    notFound();
  }

  return (
    <>
      <TabHeading heading="settings" />
      <SettingsContent action={searchParams.action} customerSettings={customerSettings} />
    </>
  );
}

export const runtime = 'edge';
