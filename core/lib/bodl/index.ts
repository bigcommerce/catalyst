import { Bodl } from './bodl';

export const bodl = new Bodl({
  // TODO: get channel id from locale in multi-lang setup
  channel_id: Number(process.env.BIGCOMMERCE_CHANNEL_ID ?? 1),
  // TODO: Replace with actual store configuration
  ga4: {
    gaId: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID ?? '',
    consentModeEnabled: false,
  },
});
