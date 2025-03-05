import { NextResponse } from 'next/server';

import { redirectToCheckout } from '~/app/[locale]/(default)/cart/_actions/redirect-to-checkout';
import { createPaymentWalletIntent } from '~/client/queries/create-payment-wallet-intent';
import { fetchCart } from '~/client/queries/get-cart';
import { getPaymentWalletWithInitializationData } from '~/client/queries/get-payment-wallet-with-initialization-data';
import { getCartId } from '~/lib/cart';

import { type MiddlewareFactory } from './compose-middlewares';

interface PaymentWalletIntentResponseBody {
  cartId: string;
  walletEntityId: string;
}

interface PaymentWalletInitializationDataResponseBody {
  entityId: string;
}

// interface RedirectToCheckoutResponseBody {
//   payment_type: string;
// }

function isPaymentWalletIntentRequestBody(data: unknown): data is PaymentWalletIntentResponseBody {
  return typeof data === 'object' && data !== null && 'walletEntityId' in data && 'cartId' in data;
}

function isPaymentWalletInitializationDataRequestBody(
  data: unknown,
): data is PaymentWalletInitializationDataResponseBody {
  return typeof data === 'object' && data !== null && 'entityId' in data;
}

export const withWalletButtonsProxyRequests: MiddlewareFactory = (next) => {
  return async (request, event) => {
    if (request.url.includes('/cart-information') && request.method === 'GET') {
      const cartId = request.nextUrl.searchParams.get('cartId');

      if (cartId) {
        try {
          const cart = await fetchCart(cartId);

          return NextResponse.json(cart);
        } catch (error) {
          return NextResponse.json({ error });
        }
      }

      return NextResponse.json(
        { error: 'Invalid request body: cartId is not provided' },
        { status: 400 },
      );
    }

    if (request.url.includes('/create-payment-wallet-intent') && request.method === 'POST') {
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
    }

    if (request.url.includes('/get-initialization-data') && request.method === 'POST') {
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
    }

    if (request.url.includes('/redirect-to-checkout') && request.method === 'GET') {
      try {
        const cartId = await getCartId();

        if (!cartId) {
          return NextResponse.json({ error: 'cart id is not defined' });
        }

        const redirectData = await redirectToCheckout(cartId);

        return NextResponse.json(redirectData);
      } catch (error) {
        return NextResponse.json({ error });
      }
    }

    return next(request, event);
  };
};
