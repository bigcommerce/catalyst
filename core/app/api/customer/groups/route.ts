import { getSiteVersion } from '@makeswift/runtime/next/server';
import { NextResponse } from 'next/server';

// Builder only. The picker calls this on every keystroke, hence the short browser cache.
const CACHE_HEADERS = { 'Cache-Control': 'private, max-age=60', Vary: 'Cookie' };

export async function GET(): Promise<NextResponse> {
  const siteVersion = await getSiteVersion();

  if (siteVersion == null) {
    return NextResponse.json(null, { status: 403 });
  }

  const authToken = process.env.BIGCOMMERCE_ACCESS_TOKEN;

  if (!authToken) {
    // eslint-disable-next-line no-console
    console.log(
      '[BigCommerce] Provide a store-level API token with "read-only" scope for Customers to query the Customer Groups API: https://support.bigcommerce.com/s/article/Store-API-Accounts#creating',
    );

    return NextResponse.json(null, { status: 403 });
  }

  const response = await fetch(
    `https://api.bigcommerce.com/stores/${process.env.BIGCOMMERCE_STORE_HASH}/v2/customer_groups`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Auth-Token': authToken,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch customer groups: ${response.statusText}`);
  }

  // `/v2/customer_groups` endpoint returns a `204 No Content` response if there are no customer groups
  if (response.status === 204) {
    return NextResponse.json([], { headers: CACHE_HEADERS });
  }

  const jsonResponse: unknown = await response.json();

  return NextResponse.json(jsonResponse, { headers: CACHE_HEADERS });
}
