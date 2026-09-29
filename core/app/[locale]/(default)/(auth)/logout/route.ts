import { NextRequest } from 'next/server';

import { signOut } from '~/auth';
import { getChannelIdFromLocale } from '~/channels.config';
import { redirect } from '~/i18n/navigation-server';
import { setForceRefreshCookie } from '~/lib/force-refresh';

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> },
) => {
  const { locale } = await params;
  const redirectTo = request.nextUrl.searchParams.get('redirectTo') ?? '/login';
  const redirectToPathname = new URL(redirectTo, request.nextUrl.origin).pathname;

  await signOut({ redirect: false, channelId: getChannelIdFromLocale(locale) });
  await setForceRefreshCookie();

  await redirect({ href: redirectToPathname, locale });
};
