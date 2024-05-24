import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';

import { getCustomerSettingsQuery } from '../page-data';

import { ChangePasswordForm } from './change-password-form';
import { TabHeading } from './tab-heading';
import { UpdateSettingsForm } from './update-settings-form';

interface Props {
  action?: string | string[];
  customerSettings: CustomerSettings;
}

type CustomerSettings = NonNullable<Awaited<ReturnType<typeof getCustomerSettingsQuery>>>;

export const SettingsContent = async ({ action, customerSettings }: Props) => {
  const locale = await getLocale();
  const messages = await getMessages({ locale });

  if (action === 'change_password') {
    return (
      <div className="mx-auto lg:w-2/3">
        <TabHeading heading={action} />
        <NextIntlClientProvider locale={locale} messages={{ Account: messages.Account ?? {} }}>
          <ChangePasswordForm />
        </NextIntlClientProvider>
      </div>
    );
  }

  return (
    <div className="mx-auto lg:w-2/3">
      <TabHeading heading="settings" />
      <UpdateSettingsForm {...customerSettings} />
    </div>
  );
};
