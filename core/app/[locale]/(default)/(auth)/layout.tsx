import { PropsWithChildren, Suspense } from 'react';

import { isLoggedIn } from '~/auth';
import { redirect } from '~/i18n/navigation';

interface Props extends PropsWithChildren {
  params: Promise<{ locale: string }>;
}

async function AuthGuard({ children, params }: Props) {
  const loggedIn = await isLoggedIn();
  const { locale } = await params;

  if (loggedIn) {
    redirect({ href: '/account/orders', locale });
  }

  return children;
}

export default function Layout({ children, params }: Props) {
  return (
    <Suspense>
      <AuthGuard params={params}>{children}</AuthGuard>
    </Suspense>
  );
}
