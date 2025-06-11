import { z } from 'zod';

const metaSchema = z.object({
  pagination: z
    .object({
      total: z.number(),
      count: z.number(),
      per_page: z.number(),
      current_page: z.number(),
      total_pages: z.number(),
    })
    .optional(),
});

export const apiResponseSchema = <T extends z.ZodSchema>(
  schema: T,
): z.ZodObject<{ data: T; meta: typeof metaSchema }> =>
  z.object({
    data: schema,
    meta: metaSchema,
  });
