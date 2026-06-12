'use client';

import { useConsentManager } from '@c15t/nextjs/client';
import { useEffect, useRef } from 'react';

import { getConsentCookie } from '~/lib/consent-manager/cookies/client';

import { startVisit } from './_actions/start-visit';

export function StartVisitOnConsent() {
  const { consents, hasConsented } = useConsentManager();
  const isMeasurementGranted = hasConsented() && consents.measurement;
  const wasMeasurementGranted = useRef(isMeasurementGranted);

  useEffect(() => {
    const shouldStartVisit = isMeasurementGranted && !wasMeasurementGranted.current;

    wasMeasurementGranted.current = isMeasurementGranted;

    if (!shouldStartVisit) {
      return;
    }

    // c15t updates its React state before persisting the consent cookie. The
    // startVisit action validates consent from the cookie server-side, so poll
    // document.cookie directly — only dispatch once the cookie is readable.
    const tryStartVisit = () => {
      if (getConsentCookie()?.['c.measurement']) {
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
