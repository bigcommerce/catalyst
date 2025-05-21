import { setVisitIdCookie, setVisitorIdCookie } from '~/lib/analytics/bigcommerce';

import { MiddlewareFactory } from './compose-middlewares';

export const withAnalyticsCookies: MiddlewareFactory = (next) => {
  return async (request, event) => {
    await setVisitorIdCookie();
    await setVisitIdCookie(onNewVisit);

    return next(request, event);
  };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function onNewVisit(visitId: string) {
  // TODO: Send shopper visit event to BigCommerce
  // await sendShopperVisitEvent(visitId);
}
