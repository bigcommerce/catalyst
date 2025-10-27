import { z } from 'zod';

const ConsentNamesSchema = z.enum([
  'necessary',
  'functionality',
  'marketing',
  'measurement',
  'experience',
]);

export const ConsentStateSchema = z.record(ConsentNamesSchema, z.boolean());

export const ConsentCookieSchema = z.object({
  preferences: ConsentStateSchema,
  timestamp: z.string().datetime(),
});
