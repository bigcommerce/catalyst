import { NextResponse } from 'next/server';

import { auth } from '~/auth';
import { getVaultAccessToken } from '~/lib/account-payments/get-vault-access-token';

export const dynamic = 'force-dynamic';

// This route is used by the account payments microapp component to retrieve a vault access token for the current shopper session
// to avoid exposing the token to the client-side code as it is a sensitive piece of information.
export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const token = await getVaultAccessToken();

    return NextResponse.json(token, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json(
      {
        error: `failed to create vault access token: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    );
  }
}
