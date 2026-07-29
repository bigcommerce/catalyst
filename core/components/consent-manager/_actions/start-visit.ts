'use server';

import { headers } from 'next/headers';
import { validate as isUuid, v4 as uuidv4 } from 'uuid';

import {
  getVisitIdCookie,
  getVisitorIdCookie,
  setVisitIdCookie,
  setVisitorIdCookie,
} from '~/lib/analytics/bigcommerce';
import { sendVisitStartedEvent } from '~/lib/analytics/bigcommerce/data-events';
import { getConsentCookie } from '~/lib/consent-manager/cookies/server';

// Starts an analytics visit after the shopper grants measurement consent.
// The proxy only starts visits on full-page navigations, so without this a
// visit granted mid-session wouldn't be recorded until the next hard reload.
// Idempotent: validates consent against the cookie and no-ops if a visit is
// already active (the proxy may have started one while handling this request).
export async function startVisit(): Promise<void> {
  const consent = await getConsentCookie();

  if (!consent?.['c.measurement']) {
    return;
  }

  const existingVisitId = await getVisitIdCookie();

  if (existingVisitId != null && isUuid(existingVisitId)) {
    return;
  }

  const existingVisitorId = await getVisitorIdCookie();
  const visitorId = existingVisitorId && isUuid(existingVisitorId) ? existingVisitorId : uuidv4();
  const visitId = uuidv4();

  await setVisitorIdCookie(visitorId);
  await setVisitIdCookie(visitId);

  const requestHeaders = await headers();

  await sendVisitStartedEvent({
    initiator: { visitId, visitorId },
    request: {
      // The action is invoked from the page the shopper accepted consent on,
      // so the referer is the URL of the visit being started.
      url: requestHeaders.get('referer') ?? '',
      refererUrl: '',
      userAgent: requestHeaders.get('user-agent') ?? '',
    },
  });
}
