import { getLocale, getTranslations } from 'next-intl/server';

import { redirect } from '~/i18n/routing';

import { ChangePasswordForm } from './_components/change-password-form';

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
  const { c: customerId, t: customerToken } = await searchParams;
  const t = await getTranslations('ChangePassword');
  const locale = await getLocale();

  if (!customerId || !customerToken) {
    redirect({ href: '/login', locale });
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
