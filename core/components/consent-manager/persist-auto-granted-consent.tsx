'use client';

import { useConsentManager } from '@c15t/nextjs/client';
import { useEffect } from 'react';

import { getConsentCookie } from '~/lib/consent-manager/cookies/client';

interface Props {
  isCookieConsentEnabled: boolean;
}

// With consent disabled, c15t's initial state grants every category but never persists
// it, so `hasConsentFor` sees no cookie. saveConsents writes to storage regardless of
// that setting, keeping the cookie the single source of truth on both sides.
//
// `StartVisitOnConsent` waits on the cookie written here to start the first visit of the
// session, since the analytics proxy couldn't see consent when it handled this request.
export function PersistAutoGrantedConsent({ isCookieConsentEnabled }: Props) {
  const { saveConsents } = useConsentManager();

  useEffect(() => {
    if (isCookieConsentEnabled || getConsentCookie()) {
      return;
    }

    saveConsents('all');
  }, [isCookieConsentEnabled, saveConsents]);

  return null;
}
