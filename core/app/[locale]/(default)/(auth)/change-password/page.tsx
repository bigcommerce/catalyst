/* eslint-disable react/jsx-no-bind */
import { getLocale, getTranslations } from 'next-intl/server';

import { ResetPasswordSection } from '@/vibes/soul/sections/reset-password-section';
import { redirect } from '~/i18n/routing';

import { changePassword } from './_actions/change-password';

export async function generateMetadata() {
  const t = await getTranslations('ChangePassword');

  return {
    title: t('title'),
  };
}

interface Props {
  searchParams: Promise<{
    c?: string;
    t?: string;
  }>;
}

export default async function ChangePassword({ searchParams }: Props) {
  const { c: customerEntityId, t: token } = await searchParams;
  const t = await getTranslations('ChangePassword');
  const locale = await getLocale();

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
