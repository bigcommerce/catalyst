import { z } from 'zod';

export const ConsentNamesSchema = z.enum([
  'experience',
  'functionality',
  'marketing',
  'measurement',
  'necessary',
]);

export const ConsentStateSchema = z.record(ConsentNamesSchema, z.boolean());

export const ConsentCookieSchema = z.object({
  preferences: ConsentStateSchema,
  timestamp: z.date(),
});
