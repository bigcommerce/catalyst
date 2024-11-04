import { getTranslations, setRequestLocale } from 'next-intl/server';

import { LocaleType } from '~/i18n/routing';

import { TabHeading } from '../../_components/tab-heading';

import { ChangePasswordForm } from './_components/change-password-form';

export async function generateMetadata() {
  const t = await getTranslations('Account.Settings.ChangePassword');

  return {
    title: t('title'),
  };
}

interface Props {
  params: { locale: LocaleType };
}

export default function ChangePassword({ params: { locale } }: Props) {
  setRequestLocale(locale);

  return (
    <>
      <TabHeading heading="settings" />
      <div className="mx-auto lg:w-2/3">
        <ChangePasswordForm />
      </div>
    </>
  );
}

export const runtime = 'edge';
