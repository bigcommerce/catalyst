import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
  if (!process.env.BIGCOMMERCE_ACCESS_TOKEN) {
    throw new Error('BIGCOMMERCE_ACCESS_TOKEN is not set');
  }

  const response = await fetch(
    `https://api.bigcommerce.com/stores/${process.env.BIGCOMMERCE_STORE_HASH}/v2/customer_groups`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Auth-Token': process.env.BIGCOMMERCE_ACCESS_TOKEN,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch customer groups: ${response.statusText}`);
  }

  const jsonResponse: unknown = await response.json();

  return NextResponse.json(jsonResponse);
}
