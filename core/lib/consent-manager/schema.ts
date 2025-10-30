import { z } from 'zod';

const ConsentNamesSchema = z.enum(['necessary', 'functionality', 'marketing', 'measurement']);
const ConsentStateSchema = z.record(ConsentNamesSchema, z.boolean());

export const ConsentCookieSchema = z.object({
  preferences: ConsentStateSchema,
  timestamp: z.string().datetime(),
});
