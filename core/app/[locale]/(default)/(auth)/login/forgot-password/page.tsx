import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { ForgotPasswordSection } from '@/vibes/soul/sections/forgot-password-section';

import { resetPassword } from './_actions/reset-password';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Auth.Login.ForgotPassword');

  return {
    title: t('title'),
  };
}

export default async function Reset() {
  const t = await getTranslations('Auth.Login.ForgotPassword');

  return (
    <ForgotPasswordSection action={resetPassword} subtitle={t('subtitle')} title={t('title')} />
  );
}
