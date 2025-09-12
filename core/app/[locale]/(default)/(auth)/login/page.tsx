/* eslint-disable react/jsx-no-bind */
import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { SignInSection } from '@/vibes/soul/sections/sign-in-section';
import { buildConfig } from '~/build-config/reader';
import { ForceRefresh } from '~/components/force-refresh';
import { Slot } from '~/lib/makeswift/slot';

import { login } from './_actions/login';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    redirectTo?: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const t = await getTranslations({ locale, namespace: 'Auth.Login' });

  return {
    title: t('title'),
  };
}

export default async function Login({ params, searchParams }: Props) {
  const { locale } = await params;
  const { redirectTo = '/account/orders' } = await searchParams;

  setRequestLocale(locale);

  const t = await getTranslations('Auth.Login');

  const vanityUrl = buildConfig.get('urls').vanityUrl;
  const redirectUrl = new URL(redirectTo, vanityUrl);
  const redirectTarget = redirectUrl.pathname + redirectUrl.search;

  return (
    <>
      <ForceRefresh />
      <SignInSection
        action={login.bind(null, { redirectTo: redirectTarget })}
        emailLabel={t('email')}
        forgotPasswordHref="/login/forgot-password"
        forgotPasswordLabel={t('forgotPassword')}
        passwordLabel={t('password')}
        submitLabel={t('cta')}
        title={t('heading')}
      >
        <Slot
          fallback={
            <div className="font-[family-name:var(--sign-in-font-family,var(--font-family-body))]">
              <h2 className="mb-10 font-[family-name:var(--sign-in-title-font-family,var(--font-family-heading))] text-4xl font-medium leading-none text-[var(--reset-password-title,hsl(var(--foreground)))] @xl:text-5xl">
                {t('CreateAccount.title')}
              </h2>
              <div className="text-[var(--sign-in-description,hsl(var(--contrast-500)))]">
                <p>{t('CreateAccount.accountBenefits')}</p>
                <ul className="mb-10 ml-4 mt-4 list-disc">
                  <li>{t('CreateAccount.fastCheckout')}</li>
                  <li>{t('CreateAccount.multipleAddresses')}</li>
                  <li>{t('CreateAccount.ordersHistory')}</li>
                  <li>{t('CreateAccount.ordersTracking')}</li>
                  <li>{t('CreateAccount.wishlists')}</li>
                </ul>
                <ButtonLink className="mt-auto w-full" href="/register" variant="secondary">
                  {t('CreateAccount.cta')}
                </ButtonLink>
              </div>
            </div>
          }
          label="Login sidebar content"
          snapshotId="login-sidebar-content"
        />
      </SignInSection>
    </>
  );
}
