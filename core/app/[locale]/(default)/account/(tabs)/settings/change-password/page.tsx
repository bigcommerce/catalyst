import { getTranslations, setRequestLocale } from 'next-intl/server';

import { TabHeading } from '../../_components/tab-heading';

import { ChangePasswordForm } from './_components/change-password-form';

export async function generateMetadata() {
  const t = await getTranslations('Account.Settings.ChangePassword');

  return {
    title: t('title'),
  };
}

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function ChangePassword({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
    <div className='mb-8'>
      <TabHeading heading="settings" /></div>
      <div className="mx-auto  lg:w-2/3">
        <ChangePasswordForm />
      </div>
    </>
  );
}

export const runtime = 'edge';
