import { validate as isUuid, v4 as uuidv4 } from 'uuid';

import {
  deleteProductViewsCookie,
  deleteVisitIdCookie,
  deleteVisitorIdCookie,
  getProductViewsCookie,
  getVisitIdCookie,
  getVisitorIdCookie,
  setProductViewsCookie,
  setVisitIdCookie,
  setVisitorIdCookie,
} from '~/lib/analytics/bigcommerce';
import { sendVisitStartedEvent } from '~/lib/analytics/bigcommerce/data-events';
import { isAnalyticsDisabled } from '~/lib/analytics/is-analytics-disabled';
import { isInteractiveRequest } from '~/lib/analytics/is-interactive-request';
import { getConsentDecision } from '~/lib/consent-manager/has-consent-for';

import { ProxyFactory } from './compose-proxies';

export const withAnalyticsCookies: ProxyFactory = (next) => {
  return async (request, event) => {
    if (isAnalyticsDisabled()) {
      // Remove cookies left over from before analytics were disabled.
      await deleteAnalyticsCookies();

      return next(request, event);
    }

    const consentDecision = await getConsentDecision('measurement', event);

    if (consentDecision === 'unknown') {
      // A transient consent-lookup failure must not be treated as withdrawal:
      // deleting would erase the visitor identity and inflate visitor/visit counts.
      return next(request, event);
    }

    if (consentDecision === 'declined') {
      // No measurement consent: never set or refresh analytics cookies, and
      // remove any left over from before consent was withdrawn. Once the
      // shopper grants consent, the startVisit server action (triggered by the
      // consent manager) creates the cookies and fires the visit event.
      await deleteAnalyticsCookies();

      return next(request, event);
    }

    const existingVisitorId = await getVisitorIdCookie();
    const existingVisitId = await getVisitIdCookie();

    const isPrefetch = request.headers.get('Next-Router-Prefetch') === '1';
    const isRSC = request.headers.get('RSC') === '1';
    const isServerAction = request.headers.get('Next-Action') !== null;

    const visitorId = existingVisitorId && isUuid(existingVisitorId) ? existingVisitorId : uuidv4();

    await setVisitorIdCookie(visitorId);

    const hasValidVisit = existingVisitId != null && isUuid(existingVisitId);

    if (hasValidVisit) {
      // Sliding window: refresh the TTL on every request
      await setVisitIdCookie(existingVisitId);

      // Expire with the visit, not with the last new product view.
      const existingProductViews = await getProductViewsCookie();

      if (existingProductViews != null) {
        await setProductViewsCookie(existingProductViews);
      }
    } else if (!isPrefetch && !isRSC && !isServerAction && isInteractiveRequest(request)) {
      // New visit on a real navigation: create cookie and fire event
      const visitId = uuidv4();

      await setVisitIdCookie(visitId);
      event.waitUntil(recordNewVisit(request, visitorId, visitId));
    }
    // Prefetch/RSC/server-action or non-interactive (bot, script, fetch,
    // subresource) request with no valid visit: skip entirely so the subsequent
    // real navigation properly detects a new visit. Server actions must not
    // start visits: cookies set here aren't visible to the action handler, so
    // the startVisit action would otherwise fire a duplicate event.

    return next(request, event);
  };
};

async function deleteAnalyticsCookies() {
  if ((await getVisitorIdCookie()) != null) {
    await deleteVisitorIdCookie();
  }

  if ((await getVisitIdCookie()) != null) {
    await deleteVisitIdCookie();
  }

  if ((await getProductViewsCookie()) != null) {
    await deleteProductViewsCookie();
  }
}

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
