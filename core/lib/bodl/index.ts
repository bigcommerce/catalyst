import { Bodl } from './bodl';

const bodl = new Bodl({
  channelId: Number(process.env.BIGCOMMERCE_CHANNEL_ID ?? 1),
  googleAnalytics: {
    id: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID ?? '',
    consentModeEnabled: false,
    developerId: 'dMjk3Nj',
  },
});

bodl.initialize();

export { bodl };
