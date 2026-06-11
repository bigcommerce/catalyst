import { validate as isUuid, v4 as uuidv4 } from 'uuid';

import {
  deleteVisitIdCookie,
  deleteVisitorIdCookie,
  getVisitIdCookie,
  getVisitorIdCookie,
  setVisitIdCookie,
  setVisitorIdCookie,
} from '~/lib/analytics/bigcommerce';
import { sendVisitStartedEvent } from '~/lib/analytics/bigcommerce/data-events';
import { hasConsentFor } from '~/lib/consent-manager/has-consent-for';

import { ProxyFactory } from './compose-proxies';

export const withAnalyticsCookies: ProxyFactory = (next) => {
  return async (request, event) => {
    const existingVisitorId = await getVisitorIdCookie();
    const existingVisitId = await getVisitIdCookie();

    if (!(await hasConsentFor('measurement'))) {
      // No measurement consent: never set or refresh analytics cookies, and
      // remove any left over from before consent was withdrawn. Once the
      // shopper grants consent, the startVisit server action (triggered by the
      // consent manager) creates the cookies and fires the visit event.
      if (existingVisitorId != null) {
        await deleteVisitorIdCookie();
      }

      if (existingVisitId != null) {
        await deleteVisitIdCookie();
      }

      return next(request, event);
    }

    const isPrefetch = request.headers.get('Next-Router-Prefetch') === '1';
    const isRSC = request.headers.get('RSC') === '1';
    const isServerAction = request.headers.get('Next-Action') !== null;

    const visitorId = existingVisitorId && isUuid(existingVisitorId) ? existingVisitorId : uuidv4();

    await setVisitorIdCookie(visitorId);

    const hasValidVisit = existingVisitId != null && isUuid(existingVisitId);

    if (hasValidVisit) {
      // Sliding window: refresh the TTL on every request
      await setVisitIdCookie(existingVisitId);
    } else if (!isPrefetch && !isRSC && !isServerAction) {
      // New visit on a real navigation: create cookie and fire event
      const visitId = uuidv4();

      await setVisitIdCookie(visitId);
      event.waitUntil(recordNewVisit(request, visitorId, visitId));
    }
    // Prefetch/RSC/server-action with no valid visit: skip entirely so the
    // subsequent real navigation properly detects a new visit. Server actions
    // must not start visits: cookies set here aren't visible to the action
    // handler, so the startVisit action would otherwise fire a duplicate event.

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
