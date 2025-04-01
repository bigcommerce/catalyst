import { NextResponse } from 'next/server';

import { getCustomer } from '~/client/queries/get-customer';

export const GET = async () => {
  try {
    const customer = await getCustomer();

    return NextResponse.json(customer);
  } catch (error) {
    return NextResponse.json({ error });
  }
};
