import { getConsentCookie } from './cookies/server';

type ConsentCategory = 'functionality' | 'marketing' | 'measurement';

// Server-side check for whether cookies of a given consent category may be stored.
// The shopper's consent cookie is the source of truth. Absent a consent cookie,
// treats consent as not given — the client-side consent manager will write the
// cookie once the shopper decides (or c15t auto-grants when consent is disabled),
// and startVisit handles recording the visit at that point.
export async function hasConsentFor(category: ConsentCategory) {
  const consent = await getConsentCookie();

  if (consent) {
    return consent[`c.${category}`];
  }

  return false;
}
