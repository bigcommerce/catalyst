import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { AccountSettingsSection } from '@/vibes/soul/sections/account-settings-section';

import { changePassword } from './_actions/change-password';
import { updateCustomer } from './_actions/update-customer';
import { getCustomerSettingsQuery } from './page-data';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Account.Settings');

  return {
    title: t('title'),
  };
}

export default async function Settings() {
  const customerSettings = await getCustomerSettingsQuery();

  if (!customerSettings) {
    notFound();
  }

  return (
    <AccountSettingsSection
      account={customerSettings.customerInfo}
      changePasswordAction={changePassword}
      updateAccountAction={updateCustomer}
    />
  );
}
