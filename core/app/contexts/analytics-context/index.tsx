import { createContext, PropsWithChildren, useContext } from 'react';
import { BcAnalytics, Bodl as BodlAnalytics } from '@bigcommerce/analytics';

const Bodl = new BodlAnalytics({
  // TODO: Replace with actual store configuration
  ga4: {
    gaId: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS ?? '',
    developerId: 0,
    consentModeEnabled: false,
  },
});

const Analytics = new BcAnalytics([Bodl], {
  channel_id: process.env.BIGCOMMERCE_CHANNEL_ID ?? '1',
});

const AnalyticsContext = createContext<BcAnalytics | null>(null);

export const AnalyticsProvider = ({ children }: PropsWithChildren) => {
  return <AnalyticsContext.Provider value={Analytics}>{children}</AnalyticsContext.Provider>;
};

export const useAnalytics = () => {
  const analytics = useContext(AnalyticsContext);

  if (!analytics) {
    throw new Error('No analytics provider found');
  }

  return analytics;
};
