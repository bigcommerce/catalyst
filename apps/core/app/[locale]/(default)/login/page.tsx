import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';

import { getReCaptchaSettings } from '~/client/queries/get-recaptcha-settings';
import { Link } from '~/components/link';
import { Button } from '~/components/ui/button';
import { LocaleType } from '~/i18n';

import { ChangePasswordForm } from './_components/change-password-form';
import { LoginForm } from './_components/login-form';
import { ResetPasswordForm } from './_components/reset-password-form';

export const metadata = {
  title: 'Login',
};

interface Props {
  params: {
    locale: LocaleType;
  };
  searchParams: {
    [key: string]: string | string[] | undefined;
    action?: 'create_account' | 'reset_password' | 'change_password';
    c?: string;
    t?: string;
  };
}

export default async function Login({ params: { locale }, searchParams }: Props) {
  const messages = await getMessages({ locale });
  const Account = messages.Account ?? {};
  const t = await getTranslations({ locale, namespace: 'Account.Login' });
  const action = searchParams.action;
  const customerId = searchParams.c;
  const customerToken = searchParams.t;

  if (action === 'change_password' && customerId && customerToken) {
    return (
      <div className="mx-auto my-6 max-w-4xl">
        <h2 className="mb-8 text-4xl font-black lg:text-5xl">{t('changePasswordHeading')}</h2>
        <NextIntlClientProvider locale={locale} messages={{ Account }}>
          <ChangePasswordForm customerId={customerId} customerToken={customerToken} />
        </NextIntlClientProvider>
      </div>
    );
  }

  if (action === 'reset_password') {
    const reCaptchaSettings = await getReCaptchaSettings();

    return (
      <div className="mx-auto my-6 max-w-4xl">
        <h2 className="mb-8 text-4xl font-black lg:text-5xl">{t('resetPasswordHeading')}</h2>
        <NextIntlClientProvider locale={locale} messages={{ Account }}>
          <ResetPasswordForm reCaptchaSettings={reCaptchaSettings} />
        </NextIntlClientProvider>
      </div>
    );
  }

  return (
    <div className="mx-auto my-6 max-w-4xl">
      <h2 className="text-h2 mb-8 text-4xl font-black lg:text-5xl">{t('heading')}</h2>
      <div className="mb-12 grid grid-cols-1 lg:grid-cols-2 lg:gap-x-8">
        <NextIntlClientProvider locale={locale} messages={{ Account }}>
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
