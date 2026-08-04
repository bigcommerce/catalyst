import { getConsentCookie } from './cookies/server';

type ConsentCategory = 'functionality' | 'marketing' | 'measurement';

// Server-side check for whether cookies of a given consent category may be stored.
// The consent cookie is the source of truth: the consent manager writes it when the
// shopper decides, or PersistAutoGrantedConsent writes it on stores that don't gate.
export async function hasConsentFor(category: ConsentCategory) {
  const consent = await getConsentCookie();

  if (consent) {
    return consent[`c.${category}`];
  }

  return false;
}
