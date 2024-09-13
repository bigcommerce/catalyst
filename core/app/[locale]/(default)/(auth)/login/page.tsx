import { useTranslations } from 'next-intl';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import { Link } from '~/components/link';
import { Button } from '~/components/ui/button';
import { locales, LocaleType } from '~/i18n/routing';

import { LoginForm } from './_components/login-form';

export async function generateMetadata() {
  const t = await getTranslations('Login');

  return {
    title: t('title'),
  };
}

interface Props {
  params: { locale: LocaleType };
}

export default function Login({ params: { locale } }: Props) {
  unstable_setRequestLocale(locale);

  const t = useTranslations('Login');

  return (
    <div className="mx-auto my-6 max-w-4xl">
      <h2 className="text-h2 mb-8 text-4xl font-black lg:text-5xl">{t('heading')}</h2>
      <div className="mb-12 grid grid-cols-1 lg:grid-cols-2 lg:gap-x-8">
        <LoginForm />
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
          <Button asChild className="w-fit items-center px-8 py-2 hover:text-white">
            <Link href="/register">{t('CreateAccount.createLink')}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const dynamic = 'force-static';
