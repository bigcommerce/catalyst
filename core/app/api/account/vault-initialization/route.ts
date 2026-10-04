import { BigCommerceAuthError } from '@bigcommerce/catalyst-client';
import { unstable_rethrow as rethrow } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';

import { auth } from '~/auth';
import { getChannelIdFromLocale } from '~/channels.config';
import { getLocaleFromRequest } from '~/i18n/request-locale';
import {
  getVaultInitialization,
  UnsupportedVaultInitializationError,
} from '~/lib/account-payments/get-vault-initialization';

export const dynamic = 'force-dynamic';

// This route is used by the account payments microapp component to retrieve a vault initialization
// for the current shopper session. It keeps the provider initialization data (and any provider-issued token)
// out of server-rendered page data, minted only through this one authenticated, per-request endpoint.
export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.customerAccessToken) {
    return NextResponse.json(
      { error: 'unauthorized' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const paymentMethodId = request.nextUrl.searchParams.get('paymentMethodId');

  if (!paymentMethodId) {
    return NextResponse.json(
      { error: 'missing paymentMethodId' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  try {
    const locale = await getLocaleFromRequest(request);
    const channelId = getChannelIdFromLocale(locale);

    const initialization = await getVaultInitialization(paymentMethodId, channelId);

    return NextResponse.json(
      { paymentProviderInitializationData: initialization },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    rethrow(error);

    if (error instanceof UnsupportedVaultInitializationError) {
      return NextResponse.json(
        { error: 'unsupported paymentMethodId' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } },
      );
    }

    if (error instanceof BigCommerceAuthError) {
      return NextResponse.json(
        { error: 'unauthorized' },
        { status: 401, headers: { 'Cache-Control': 'no-store' } },
      );
    }

    // eslint-disable-next-line no-console
    console.error(error);

    return NextResponse.json(
      { error: 'failed to create vault initialization' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
