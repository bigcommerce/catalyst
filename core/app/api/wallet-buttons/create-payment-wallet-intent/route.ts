import { NextRequest, NextResponse } from 'next/server';

import { createPaymentWalletIntent } from '~/client/queries/create-payment-wallet-intent';

interface PaymentWalletIntentResponseBody {
  cartId: string;
  walletEntityId: string;
}

function isPaymentWalletIntentRequestBody(data: unknown): data is PaymentWalletIntentResponseBody {
  return typeof data === 'object' && data !== null && 'walletEntityId' in data && 'cartId' in data;
}

export const POST = async (request: NextRequest) => {
  const data: unknown = await request.json();

  if (isPaymentWalletIntentRequestBody(data)) {
    try {
      const dataIntent = await createPaymentWalletIntent(data.cartId, data.walletEntityId);

      return NextResponse.json(dataIntent);
    } catch (error) {
      return NextResponse.json({ error });
    }
  }

  return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
};
