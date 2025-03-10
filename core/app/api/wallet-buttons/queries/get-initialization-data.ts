import { NextRequest, NextResponse } from 'next/server';

import { getPaymentWalletWithInitializationData } from '~/client/queries/get-payment-wallet-with-initialization-data';

interface PaymentWalletInitializationDataResponseBody {
  entityId: string;
}

function isPaymentWalletInitializationDataRequestBody(
  data: unknown,
): data is PaymentWalletInitializationDataResponseBody {
  return typeof data === 'object' && data !== null && 'entityId' in data;
}

export const getInitializationData = async (request: NextRequest) => {
  const data: unknown = await request.json();

  if (isPaymentWalletInitializationDataRequestBody(data)) {
    try {
      const initializationData = await getPaymentWalletWithInitializationData(data.entityId);

      return NextResponse.json(initializationData);
    } catch (error) {
      return NextResponse.json({ error });
    }
  }

  return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
};
