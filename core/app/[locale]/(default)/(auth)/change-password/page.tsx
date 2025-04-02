/* eslint-disable react/jsx-no-bind */
import { Metadata } from 'next';
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
  const { locale } = await params;

  const t = await getTranslations({ locale, namespace: 'ChangePassword' });

  return {
    title: t('title'),
  };
}

export default async function ChangePassword({ params, searchParams }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const { c: customerEntityId, t: token } = await searchParams;
  const t = await getTranslations('ChangePassword');

  if (!customerEntityId || !token) {
    return redirect({ href: '/login', locale });
  }

  return (
    <ResetPasswordSection
      action={changePassword.bind(null, { customerEntityId, token })}
      confirmPasswordLabel={t('Form.confirmPasswordLabel')}
      newPasswordLabel={t('Form.newPasswordLabel')}
      title={t('heading')}
    />
  );
}
