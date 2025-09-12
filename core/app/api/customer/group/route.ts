import { NextResponse } from 'next/server';

import { getCustomerGroupId } from '~/client/queries/get-customer';

export async function GET(): Promise<NextResponse> {
  const { data } = await getCustomerGroupId();

  return NextResponse.json(data);
}
