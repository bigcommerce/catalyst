import { BigCommerceAuthError } from '@bigcommerce/catalyst-client';
import { NextRequest, NextResponse } from 'next/server';

import { auth } from '~/auth';
import { getChannelIdFromLocale } from '~/channels.config';
import { getLocaleRouting } from '~/i18n/locale-config';
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

// This route is used by the account payments microapp component to retrieve a vault access token for the current shopper session
// to avoid exposing the token to the client-side code as it is a sensitive piece of information.
export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.customerAccessToken) {
    return NextResponse.json(
      { error: 'unauthorized' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  try {
    const localeRouting = await getLocaleRouting();
    const refererPathname = getRefererPathname(request);
    const locale = refererPathname
      ? getLocaleFromPathname(localeRouting, refererPathname)
      : (localeRouting.rootLocale ?? localeRouting.defaultLocale);
    const channelId = getChannelIdFromLocale(locale);

    const token = await getVaultAccessToken(channelId);

    return NextResponse.json(token, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
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
