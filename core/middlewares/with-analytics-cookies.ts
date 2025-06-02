import { NextRequest } from 'next/server';
import { validate as isUuid, v4 as uuidv4 } from 'uuid';

import {
  getVisitIdCookie,
  getVisitorIdCookie,
  setVisitIdCookie,
  setVisitorIdCookie,
} from '~/lib/analytics/bigcommerce';

import { MiddlewareFactory } from './compose-middlewares';

export const withAnalyticsCookies: MiddlewareFactory = (next) => {
  return async (request, event) => {
    let visitorId = await getVisitorIdCookie();
    let visitId = await getVisitIdCookie();

    if (!visitorId || !isUuid(visitorId)) {
      visitorId = uuidv4();
    }

    // Update the visitorId cookie every time
    await setVisitorIdCookie(visitorId);

    if (!visitId || !isUuid(visitId)) {
      visitId = uuidv4();
      await setVisitIdCookie(visitId);
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
