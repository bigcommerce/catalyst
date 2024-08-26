import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';

import { ExistingResultType } from '~/client/util';

import { getCustomerSettingsQuery } from '../page-data';

import { ChangePasswordForm } from './change-password-form';
import { UpdateSettingsForm } from './update-settings-form';

interface Props {
  action?: string | string[];
  customerSettings: CustomerSettings;
}

type CustomerSettings = ExistingResultType<typeof getCustomerSettingsQuery>;

export const SettingsContent = async ({ action, customerSettings }: Props) => {
  const locale = await getLocale();
  const messages = await getMessages({ locale });

  if (action === 'change_password') {
    return (
      <div className="mx-auto lg:w-2/3">
        <NextIntlClientProvider locale={locale} messages={{ Account: messages.Account ?? {} }}>
          <ChangePasswordForm />
        </NextIntlClientProvider>
      </div>
    );
  }

  return (
    <div className="mx-auto lg:w-2/3">
      <UpdateSettingsForm {...customerSettings} />
    </div>
  );
};
