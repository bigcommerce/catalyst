import { Metadata } from 'next';
import { SubmissionResult } from '@conform-to/react';
import { getTranslations } from 'next-intl/server';

import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { SignInSection } from '@/vibes/soul/sections/sign-in-section';
import { ForceRefresh } from '~/components/force-refresh';

import { login } from './_actions/login';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Login');

  return {
    title: t('title'),
  };
}

export default async function Login({
  searchParams,
}: {
  searchParams: { redirectTo?: string };
}) {
  const t = await getTranslations('Login');
  const { redirectTo = '/account/orders' } = searchParams;

  // Create a new action with the redirectTo parameter bound to it
  async function loginWithRedirect(lastResult: SubmissionResult | null, formData: FormData) {
    'use server';
    
    // Add the redirectTo parameter to the formData
    formData.append('redirectTo', redirectTo);
    return login(lastResult, formData);
  }

  return (
    <>
      <ForceRefresh />
      <SignInSection
        action={loginWithRedirect}
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
