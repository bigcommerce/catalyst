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

      event.waitUntil(recordNewVisit(request, visitorId, visitId));
    }

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
