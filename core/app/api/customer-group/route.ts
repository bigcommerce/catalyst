import { NextResponse } from 'next/server';

import { getCustomer } from '~/client/queries/get-customer';

export async function GET() {
  const { data } = await getCustomer();

  return NextResponse.json(data);
}
