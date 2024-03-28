import { BookUser, Eye, Gift, Mail, Package, Settings } from 'lucide-react';
import { redirect } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { ReactNode } from 'react';

import { auth } from '~/auth';
import { Link } from '~/components/link';
import { LocaleType } from '~/i18n';

import { ChangePasswordForm } from '../login/_components/change-password-form';

interface AccountItem {
  children: ReactNode;
  description?: string;
  href: string;
  title: string;
}

const AccountItem = ({ children, title, description, href }: AccountItem) => {
  return (
    <Link
      className="flex items-center border border-gray-200 p-6 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
      href={href}
    >
      {children}
      <span>
        <h3 className="text-xl font-bold lg:text-2xl">{title}</h3>
        {description ? <p>{description}</p> : null}
      </span>
    </Link>
  );
};

interface Props {
  params: {
    locale: LocaleType;
  };
  searchParams: {
    action?: 'reset_password';
  };
}

export default async function AccountPage({ params: { locale }, searchParams: { action } }: Props) {
  const session = await auth();
  const t = await getTranslations({ locale, namespace: 'Account.Home' });
  const messages = await getMessages({ locale });
  const Account = messages.Account ?? {};

  if (!session) {
    redirect('/login');
  }

  if (action === 'reset_password') {
    return (
      <div className="mx-auto my-6 max-w-4xl">
        <h2 className="mb-8 text-4xl font-black lg:text-5xl">{t('changePassword')}</h2>
        <NextIntlClientProvider locale={locale} messages={{ Account }}>
          <ChangePasswordForm isLoggedIn={true} />
        </NextIntlClientProvider>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-screen-xl">
      <h1 className="my-6 my-8 text-4xl font-black lg:my-8 lg:text-5xl">{t('heading')}</h1>

      <div className="mb-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AccountItem href="/account/orders" title={t('orders')}>
          <Package className="me-8" height={48} width={48} />
        </AccountItem>
        <AccountItem href="/account/messages" title={t('messages')}>
          <Mail className="me-8" height={48} width={48} />
        </AccountItem>
        <AccountItem href="/account/addresses" title={t('addresses')}>
          <BookUser className="me-8" height={48} width={48} />
        </AccountItem>
        <AccountItem href="/account/wishlists" title={t('wishlists')}>
          <Gift className="me-8" height={48} width={48} />
        </AccountItem>
        <AccountItem href="/account/recently-viewed" title={t('recentlyViewed')}>
          <Eye className="me-8" height={48} width={48} />
        </AccountItem>
        <AccountItem href="/account/settings" title={t('accountSettings')}>
          <Settings className="me-8" height={48} width={48} />
        </AccountItem>
      </div>
    </div>
  );
}
