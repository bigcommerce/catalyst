/* eslint-disable react/jsx-no-bind */
import { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { ResetPasswordSection } from '@/vibes/soul/sections/reset-password-section';
import { redirect } from '~/i18n/routing';

import { changePassword } from './_actions/change-password';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    c?: string;
    t?: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // MIGRATED: With Cache Components, generateMetadata accessing async data causes blocking
  // Using static metadata to avoid blocking route errors
  // TODO: Consider using "use cache" if dynamic metadata is needed
  return {
    title: 'Change Password',
  };
}

async function ChangePasswordContent({
  localePromise,
  searchParamsPromise,
}: {
  localePromise: Promise<{ locale: string }>;
  searchParamsPromise: Promise<{
    c?: string;
    t?: string;
  }>;
}) {
  const { locale } = await localePromise;
  const { c: customerEntityId, t: token } = await searchParamsPromise;

  if (!customerEntityId || !token) {
    redirect({ href: '/login', locale });
  }

  setRequestLocale(locale);

  const t = await getTranslations('Auth.ChangePassword');

  return (
    <ResetPasswordSection
      action={changePassword.bind(null, { customerEntityId: customerEntityId!, token: token! })}
      confirmPasswordLabel={t('confirmPassword')}
      newPasswordLabel={t('newPassword')}
      title={t('title')}
    />
  );
}

export default function ChangePassword({ params, searchParams }: Props) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChangePasswordContent localePromise={params} searchParamsPromise={searchParams} />
    </Suspense>
  );
}
