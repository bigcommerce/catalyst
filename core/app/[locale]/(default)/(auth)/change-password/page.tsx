import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { redirect } from '~/i18n/routing';

import { ChangePasswordForm } from './_components/change-password-form';

export async function generateMetadata() {
  const t = await getTranslations('ChangePassword');

  return {
    title: t('title'),
  };
}

interface Props {
  searchParams: {
    c?: string;
    t?: string;
  };
}

export default function ChangePassword({ searchParams }: Props) {
  const t = useTranslations('ChangePassword');

  const customerId = searchParams.c;
  const customerToken = searchParams.t;

  if (!customerId || !customerToken) {
    redirect('/login');
  }

  if (customerId && customerToken) {
    return (
      <div className="mx-auto my-6 max-w-4xl">
        <h2 className="mb-8 text-4xl font-black lg:text-5xl">{t('heading')}</h2>
        <ChangePasswordForm customerId={customerId} customerToken={customerToken} />
      </div>
    );
  }

  return null;
}

export const runtime = 'edge';
