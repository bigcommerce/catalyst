'use client';

import { useConsentManager } from '@c15t/nextjs/client';
import { useEffect, useRef } from 'react';

import { getConsentCookie } from '~/lib/consent-manager/cookies/client';

import { startVisit } from './_actions/start-visit';

export function StartVisitOnConsent() {
  const { consents, hasConsented } = useConsentManager();
  const isMeasurementGranted = hasConsented() && consents.measurement;

  // True once this session's visit is accounted for: either the analytics proxy already
  // saw consent when it handled this request, or we dispatched startVisit ourselves.
  // Seeded from the consent cookie rather than c15t's in-memory state, since the cookie is
  // what the proxy read. On stores with cookie consent disabled, c15t grants every category
  // while constructing its store — before the first render — so an in-memory seed would
  // treat that grant as pre-existing and never dispatch.
  const hasStartedVisit = useRef<boolean | null>(null);

  if (hasStartedVisit.current === null) {
    hasStartedVisit.current = getConsentCookie()?.['c.measurement'] ?? false;
  }

  useEffect(() => {
    if (!isMeasurementGranted) {
      // Consent withdrawn: the proxy clears the analytics cookies, so a later re-grant
      // needs to start a fresh visit.
      hasStartedVisit.current = false;

      return;
    }

    if (hasStartedVisit.current) {
      return;
    }

    // c15t updates its React state before persisting the consent cookie. The startVisit
    // action validates consent from the cookie server-side, so poll document.cookie
    // directly — only dispatch once the cookie is readable. The flag flips on dispatch
    // rather than up front, so a poll cancelled before it succeeds (StrictMode remounts
    // effects in development) is retried rather than treated as already done.
    const tryStartVisit = () => {
      if (getConsentCookie()?.['c.measurement']) {
        hasStartedVisit.current = true;

        // eslint-disable-next-line no-console
        void startVisit().catch(console.error);

        return true;
      }

      return false;
    };

    if (tryStartVisit()) {
      return;
    }

    let attempts = 0;
    const interval = setInterval(() => {
      attempts += 1;

      if (tryStartVisit() || attempts >= 20) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isMeasurementGranted]);

  return null;
}
