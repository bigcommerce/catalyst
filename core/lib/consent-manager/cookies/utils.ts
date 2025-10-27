import { z } from 'zod';

import { ConsentCookieSchema, ConsentStateSchema } from '../schema';

type ConsentState = z.infer<typeof ConsentStateSchema>;
type ConsentCookie = z.infer<typeof ConsentCookieSchema>;
type BigCommerceScriptConsentCategory =
  | 'ANALYTICS'
  | 'ESSENTIAL'
  | 'FUNCTIONAL'
  | 'TARGETING'
  | 'UNKNOWN';

export const getConsentCategoriesFromCookie = (
  consent: ConsentCookie | null,
): BigCommerceScriptConsentCategory[] => {
  if (!consent) {
    return ['ESSENTIAL'];
  }

  const categories: BigCommerceScriptConsentCategory[] = [];
  const mapping: Record<keyof ConsentState, BigCommerceScriptConsentCategory> = {
    measurement: 'ANALYTICS',
    necessary: 'ESSENTIAL',
    functionality: 'FUNCTIONAL',
    experience: 'FUNCTIONAL',
    marketing: 'TARGETING',
  };

  const preferences = consent.preferences;
  const entries = Object.entries(preferences);

  const enabledCategories = entries
    .filter(([, value]) => value)
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    .map(([key]) => mapping[key as keyof ConsentState]);

  categories.push(...enabledCategories);

  const allTruthy = entries.every(([, value]) => value);

  if (allTruthy) {
    categories.push('UNKNOWN');
  }

  return categories;
};
