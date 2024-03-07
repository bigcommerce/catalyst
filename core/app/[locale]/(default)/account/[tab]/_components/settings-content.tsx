import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';

import { TabType } from '../layout';

import { ChangePasswordForm } from './change-password-form';
import { TabHeading } from './tab-heading';

interface Props {
  title: TabType;
  action?: string | string[];
}

export const SettingsContent = async ({ title, action }: Props) => {
  const locale = await getLocale();
  const messages = await getMessages({ locale });

  if (action === 'change-password') {
    return (
      <div className="mx-auto lg:w-2/3">
        <TabHeading heading={action} locale={locale} />
        <NextIntlClientProvider locale={locale} messages={{ Account: messages.Account ?? {} }}>
          <ChangePasswordForm />
        </NextIntlClientProvider>
      </div>
    );
  }

  return <TabHeading heading={title} locale={locale} />;
};
