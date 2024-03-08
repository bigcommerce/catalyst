import { Button } from '@bigcommerce/components/button';
import { NextIntlClientProvider, useMessages, useTranslations } from 'next-intl';

import { Link } from '~/components/link';
import { LocaleType } from '~/i18n';

import { LoginForm } from './_components/login-form';

export const metadata = {
  title: 'Login',
};

interface Props {
  params: {
    locale: LocaleType;
  };
}

export default function Login({ params: { locale } }: Props) {
  const messages = useMessages();
  const t = useTranslations('Account.Login');

  return (
    <div className="mx-auto my-6 max-w-4xl">
      <h2 className="text-h2 mb-8">{t('heading')}</h2>
      <div className="mb-12 grid grid-cols-1 lg:grid-cols-2 lg:gap-x-8">
        <NextIntlClientProvider locale={locale} messages={{ Account: messages.Account ?? {} }}>
          <LoginForm />
        </NextIntlClientProvider>
        <div className="flex flex-col gap-4 bg-gray-100 p-8">
          <h3 className="text-h5 mb-3">{t('CreateAccount.heading')}</h3>
          <p className="text-base font-semibold">{t('CreateAccount.accountBenefits')}</p>
          <ul className="list-disc ps-4">
            <li>{t('CreateAccount.fastCheckout')}</li>
            <li>{t('CreateAccount.multipleAddresses')}</li>
            <li>{t('CreateAccount.ordersHistory')}</li>
            <li>{t('CreateAccount.ordersTracking')}</li>
            <li>{t('CreateAccount.wishlists')}</li>
          </ul>
          <Button asChild className="w-fit items-center px-8 py-2">
            <Link
              href={{
                pathname: '/login',
                query: { action: 'create_account' },
              }}
            >
              {t('CreateAccount.createLink')}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export const runtime = 'edge';
