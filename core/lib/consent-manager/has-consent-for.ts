import type { NextFetchEvent } from 'next/server';

import { getConsentCookie } from './cookies/server';
import { isCookieConsentEnabled } from './is-cookie-consent-enabled';

export type ConsentDecision = 'granted' | 'declined' | 'unknown';
type ConsentCategory = 'functionality' | 'marketing' | 'measurement';

// Server-side check for whether cookies of a given consent category may be stored.
// The shopper's consent cookie is the source of truth when present. Without one,
// consent is implicit on stores with cookie consent disabled: c15t grants all
// categories client-side there but never persists them.
// `event` lets the proxy hand off background KV cache writes to `waitUntil`,
// which outlives the response; without it the runtime may kill them mid-flight.
export async function getConsentDecision(
  category: ConsentCategory,
  event?: NextFetchEvent,
): Promise<ConsentDecision> {
  const consent = await getConsentCookie();

  if (consent) {
    return consent[`c.${category}`] ? 'granted' : 'declined';
  }

  const enabled = await isCookieConsentEnabled(event);

  if (enabled === null) {
    return 'unknown';
  }

  // With consent enabled and no cookie, the shopper is undecided; treat it as declined.
  return enabled ? 'declined' : 'granted';
}

export async function hasConsentFor(category: ConsentCategory): Promise<boolean> {
  return (await getConsentDecision(category)) === 'granted';
}
