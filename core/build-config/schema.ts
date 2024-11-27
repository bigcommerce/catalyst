import { z } from 'zod';

export const buildConfigSchema = z.object({
  locales: z.array(
    z.object({
      code: z.string(),
      isDefault: z.boolean(),
    }),
  ),
});

export type BuildConfigSchema = z.infer<typeof buildConfigSchema>;
