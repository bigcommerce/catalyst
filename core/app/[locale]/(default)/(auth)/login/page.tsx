import { useTranslations } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { SignInSection } from '@/vibes/soul/sections/sign-in-section';
import { Link } from '~/components/link';
import { Button } from '~/components/ui/button';
import { locales, LocaleType } from '~/i18n/routing';

import { login } from './_actions/login';

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
  setRequestLocale(locale);

  const t = useTranslations('Login');

  return (
    <SignInSection
      action={login}
      forgotPasswordHref="/login/forgot-password"
      forgotPasswordLabel={t('Form.forgotPassword')}
      submitLabel={t('Form.logIn')}
      title={t('heading')}
    >
      <div className="">
        <h3 className="mb-3 text-xl font-bold lg:text-2xl">{t('CreateAccount.heading')}</h3>
        <p className="text-base font-semibold">{t('CreateAccount.accountBenefits')}</p>
        <ul className="mb-4 list-disc ps-4">
          <li>{t('CreateAccount.fastCheckout')}</li>
          <li>{t('CreateAccount.multipleAddresses')}</li>
          <li>{t('CreateAccount.ordersHistory')}</li>
          <li>{t('CreateAccount.ordersTracking')}</li>
          <li>{t('CreateAccount.wishlists')}</li>
        </ul>
        <Button asChild>
          <Link href="/register">{t('CreateAccount.createLink')}</Link>
        </Button>
      </div>
    </SignInSection>
  );
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const dynamic = 'force-static';
