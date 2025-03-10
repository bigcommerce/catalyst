import { NextRequest } from 'next/server';

import { getCartInformation } from './queries/cart-information';
import { createPaymentWalletIntentData } from './queries/create-payment-wallet-intent';
import { getInitializationData } from './queries/get-initialization-data';
import { redirectToCheckoutPage } from './queries/redirect-to-checkout-page';

export const walletButtonsRequestHandler = async (request: NextRequest) => {
  if (request.url.includes('/cart-information') && request.method === 'GET') {
    return getCartInformation(request);
  }

  if (request.url.includes('/create-payment-wallet-intent') && request.method === 'POST') {
    return createPaymentWalletIntentData(request);
  }

  if (request.url.includes('/get-initialization-data') && request.method === 'POST') {
    return getInitializationData(request);
  }

  if (request.url.includes('/redirect-to-checkout') && request.method === 'GET') {
    return redirectToCheckoutPage();
  }
};
