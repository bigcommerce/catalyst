import { validate as isUuid, v4 as uuidv4 } from 'uuid';

import {
  getVisitIdCookie,
  getVisitorIdCookie,
  setVisitIdCookie,
  setVisitorIdCookie,
} from '~/lib/analytics/bigcommerce';
import { sendVisitStartedEvent } from '~/lib/analytics/bigcommerce/data-events';

import { MiddlewareFactory } from './compose-middlewares';

export const withAnalyticsCookies: MiddlewareFactory = (next) => {
  return async (request, event) => {
    const existingVisitorId = await getVisitorIdCookie();
    const existingVisitId = await getVisitIdCookie();

    const isPrefetch = request.headers.get('Next-Router-Prefetch') === '1';
    const isRSC = request.headers.get('RSC') === '1';

    const visitorId = existingVisitorId && isUuid(existingVisitorId) ? existingVisitorId : uuidv4();

    await setVisitorIdCookie(visitorId);

    const hasValidVisit = existingVisitId != null && isUuid(existingVisitId);

    if (hasValidVisit) {
      // Sliding window: refresh the TTL on every request
      await setVisitIdCookie(existingVisitId);
    } else if (!isPrefetch && !isRSC) {
      // New visit on a real navigation: create cookie and fire event
      const visitId = uuidv4();

      await setVisitIdCookie(visitId);
      event.waitUntil(recordNewVisit(request, visitorId, visitId));
    }
    // Prefetch/RSC with no valid visit: skip entirely so the
    // subsequent real navigation properly detects a new visit.

    return next(request, event);
  };
};

async function recordNewVisit(request: Request, visitorId: string, visitId: string) {
  await sendVisitStartedEvent({
    initiator: { visitId, visitorId },
    request: {
      url: request.url,
      refererUrl: request.headers.get('referer') || '',
      userAgent: request.headers.get('user-agent') || '',
    },
  });
}
