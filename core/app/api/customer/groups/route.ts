import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
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
    // eslint-disable-next-line no-console
    console.error(`Failed to fetch customer groups: ${response.status} ${response.statusText}`);

    return NextResponse.json(null, { status: 500 });
  }

  // `/v2/customer_groups` endpoint returns a `204 No Content` response if there are no customer groups
  if (response.status === 204) {
    return NextResponse.json([]);
  }

  const jsonResponse: unknown = await response.json();

  return NextResponse.json(jsonResponse);
}
