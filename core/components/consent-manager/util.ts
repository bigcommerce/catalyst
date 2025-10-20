import { z } from 'zod';

import { ConsentStateSchema } from './schema';

type ConsentState = z.infer<typeof ConsentStateSchema>;
type ScriptConsentCategory = 'ANALYTICS' | 'ESSENTIAL' | 'FUNCTIONAL' | 'TARGETING' | 'UNKNOWN';

export function mapC15tToBigCommerceConsent(consent: ConsentState | null): ScriptConsentCategory[] {
  const categories: ScriptConsentCategory[] = [];

  if (!consent) {
    categories.push('ESSENTIAL');

    return categories;
  }

  if (consent.measurement) {
    categories.push('ANALYTICS');
  }

  if (consent.necessary) {
    categories.push('ESSENTIAL');
  }

  if (consent.functionality) {
    categories.push('FUNCTIONAL');
  }

  if (consent.marketing) {
    categories.push('TARGETING');
  }

  return categories;
}
