import { z } from 'zod';

// Locales are deliberately absent. They are merchant-configurable at any time, so a build-time
// snapshot is either redundant or wrong — see `~/i18n/locale-config`.
export const buildConfigSchema = z.object({
  urls: z.object({
    vanityUrl: z.string(),
    cdnUrls: z.array(z.string()).default(['cdn11.bigcommerce.com']),
    checkoutUrl: z.string(),
  }),
});

export type BuildConfigSchema = z.infer<typeof buildConfigSchema>;
