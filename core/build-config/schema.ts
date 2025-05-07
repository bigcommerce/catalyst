import { z } from 'zod';

export const buildConfigSchema = z.object({
  locales: z.array(
    z.object({
      code: z.string(),
      isDefault: z.boolean(),
    }),
  ),
  urls: z.object({
    vanityUrl: z.string(),
    cdnUrls: z.array(z.string()).default(['cdn11.bigcommerce.com']),
    checkoutUrl: z.string(),
  }),
});

export type BuildConfigSchema = z.infer<typeof buildConfigSchema>;
