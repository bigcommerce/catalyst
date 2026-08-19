import { NextRequest } from 'next/server';

import { signOut } from '~/auth';
import { redirect } from '~/i18n/navigation-server';
import { setForceRefreshCookie } from '~/lib/force-refresh';

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> },
) => {
  const { locale } = await params;
  const redirectTo = request.nextUrl.searchParams.get('redirectTo') ?? '/login';
  const redirectToPathname = new URL(redirectTo, request.nextUrl.origin).pathname;

  await signOut({ redirect: false });
  await setForceRefreshCookie();

  await redirect({ href: redirectToPathname, locale });
};
