import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { createLoader, parseAsString, SearchParams } from 'nuqs/server';

import { ResetPasswordSection } from '@/vibes/soul/sections/reset-password-section';
import { redirect } from '~/i18n/routing';

import { changePassword } from './_actions/change-password';

const loadSearchParams = createLoader({
  c: parseAsString,
  t: parseAsString,
});

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('ChangePassword');

  return {
    title: t('title'),
  };
}

export default async function ChangePassword({ params, searchParams }: Props) {
  const { locale } = await params;
  const { c: customerEntityId, t: token } = await loadSearchParams(searchParams);
  const t = await getTranslations('ChangePassword');

  if (!customerEntityId || !token) {
    return redirect({ href: '/login', locale });
  }

  return (
    <ResetPasswordSection
      // eslint-disable-next-line react/jsx-no-bind
      action={changePassword.bind(null, { customerEntityId, token })}
      confirmPasswordLabel={t('Form.confirmPasswordLabel')}
      newPasswordLabel={t('Form.newPasswordLabel')}
      title={t('heading')}
    />
  );
}
