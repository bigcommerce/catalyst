import { NextRequest } from 'next/server';

import { setVisitIdCookie, setVisitorIdCookie } from '~/lib/analytics/bigcommerce';

import { MiddlewareFactory } from './compose-middlewares';

export const withAnalyticsCookies: MiddlewareFactory = (next) => {
  return async (request, event) => {
    const visitorId = await setVisitorIdCookie();
    const { id: visitId, isNew: isVisitNew } = await setVisitIdCookie();

    if (isVisitNew) {
      event.waitUntil(sendShopperVisitEvent(request, visitorId, visitId));
    }

    return next(request, event);
  };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function sendShopperVisitEvent(request: NextRequest, visitorId: string, visitId: string) {
  // fetch from request user agent, url and referer url
  // TODO: Send shopper visit event to BigCommerce
}
