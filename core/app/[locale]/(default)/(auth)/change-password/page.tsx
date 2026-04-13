/* eslint-disable react/jsx-no-bind */
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { ResetPasswordSection } from '@/vibes/soul/sections/reset-password-section';
import { getChangePasswordQuery } from '~/app/[locale]/(default)/(auth)/change-password/page-data';
import { redirect } from '~/i18n/navigation';

import { changePassword } from './_actions/change-password';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    c?: string;
    t?: string;
  }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Auth.ChangePassword');

  return {
    title: t('title'),
  };
}

export default async function ChangePassword({ params, searchParams }: Props) {
  const { locale } = await params;

  const { c: customerEntityId, t: token } = await searchParams;
  const t = await getTranslations('Auth.ChangePassword');

  if (!customerEntityId || !token) {
    return redirect({ href: '/login', locale });
  }

  const { passwordComplexitySettings } = await getChangePasswordQuery(locale);

  return (
    <ResetPasswordSection
      action={changePassword.bind(null, { customerEntityId, token })}
      confirmPasswordLabel={t('confirmPassword')}
      newPasswordLabel={t('newPassword')}
      passwordComplexitySettings={passwordComplexitySettings}
      title={t('title')}
    />
  );
}
