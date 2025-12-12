import { z } from 'zod';

// Optional consent that can only be 1 (if present), returns false if absent
const optionalConsent = z
  .literal(1)
  .optional()
  .transform((val) => val === 1);

export const ConsentCookieSchema = z.object({
  // timestamp in milliseconds
  'i.t': z.number().int().positive(),
  // required consent, returns true
  'c.necessary': z.literal(1).transform(() => true),
  // optional consents (if present, must be 1, returns true)
  'c.functionality': optionalConsent,
  'c.marketing': optionalConsent,
  'c.measurement': optionalConsent,
});
