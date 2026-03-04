import { setRequestLocale } from 'next-intl/server';
import { PropsWithChildren, Suspense } from 'react';

import { isLoggedIn } from '~/auth';
import { redirect } from '~/i18n/routing';

interface Props extends PropsWithChildren {
  params: Promise<{ locale: string }>;
}

async function AuthCheck({ locale, children }: { locale: string; children: React.ReactNode }) {
  const loggedIn = await isLoggedIn();

  if (loggedIn) {
    redirect({ href: '/account/orders', locale });
  }

  return children;
}

export default async function Layout({ children, params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <Suspense>
      <AuthCheck locale={locale}>{children}</AuthCheck>
    </Suspense>
  );
}
