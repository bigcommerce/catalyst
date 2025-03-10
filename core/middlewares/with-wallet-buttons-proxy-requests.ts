import { walletButtonsRequestHandler } from '~/app/api/wallet-buttons/wallet-buttons-request-handler';

import { type MiddlewareFactory } from './compose-middlewares';

export const withWalletButtonsProxyRequests: MiddlewareFactory = (next) => {
  return async (request, event) => {
    return (await walletButtonsRequestHandler(request)) ?? next(request, event);
  };
};
