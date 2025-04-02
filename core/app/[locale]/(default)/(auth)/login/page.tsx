import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { SignInSection } from '@/vibes/soul/sections/sign-in-section';
import { ForceRefresh } from '~/components/force-refresh';

import { login } from './_actions/login';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const t = await getTranslations({ locale, namespace: 'Login' });

  return {
    title: t('title'),
  };
}

export default async function Login({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const t = await getTranslations('Login');

  return (
    <>
      <ForceRefresh />
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
          <ButtonLink href="/register" variant="secondary">
            {t('CreateAccount.createLink')}
          </ButtonLink>
        </div>
      </SignInSection>
    </>
  );
}
