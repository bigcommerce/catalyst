import { BigCommerceAuthError } from '@bigcommerce/catalyst-client';
import { unstable_rethrow as rethrow } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';

import { auth } from '~/auth';
import { getChannelIdFromLocale } from '~/channels.config';
import { fetchLocaleRouting } from '~/i18n/locale-config';
import { getLocaleFromPathname } from '~/i18n/locale-routing';
import { getVaultAccessToken } from '~/lib/account-payments/get-vault-access-token';

export const dynamic = 'force-dynamic';

function getRefererPathname(request: NextRequest) {
  const referer = request.headers.get('referer');

  if (!referer) {
    return null;
  }

  try {
    return new URL(referer).pathname;
  } catch {
    return null;
  }
}

// This route is used by the account payments microapp component to retrieve a vault access token
// for the current shopper session. It keeps the token out of server-rendered page data, so it can't
// leak into HTML or RSC payloads, and mint it only through this one authenticated, per-request endpoint
// rather than embedding it anywhere upstream.
export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.customerAccessToken) {
    return NextResponse.json(
      { error: 'unauthorized' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  try {
    const localeRouting = await fetchLocaleRouting();
    const queryLocale = request.nextUrl.searchParams.get('locale');
    const refererPathname = getRefererPathname(request);
    const locale =
      (queryLocale && localeRouting.locales.includes(queryLocale) ? queryLocale : null) ??
      (refererPathname ? getLocaleFromPathname(localeRouting, refererPathname) : null) ??
      localeRouting.rootLocale ??
      localeRouting.defaultLocale;
    const channelId = getChannelIdFromLocale(locale);

    const token = await getVaultAccessToken(channelId);

    return NextResponse.json(token, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    rethrow(error);

    if (error instanceof BigCommerceAuthError) {
      return NextResponse.json(
        { error: 'unauthorized' },
        { status: 401, headers: { 'Cache-Control': 'no-store' } },
      );
    }

    return NextResponse.json(
      { error: 'failed to create vault access token' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
