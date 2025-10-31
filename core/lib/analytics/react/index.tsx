'use client';

import { createContext, PropsWithChildren, useContext, useEffect } from 'react';

import { type Analytics } from '../types';

const AnalyticsContext = createContext<Analytics | null>(null);

interface AnalyticsProviderProps {
  analytics: Analytics | null;
}

export const AnalyticsProvider = ({
  children,
  analytics,
}: PropsWithChildren<AnalyticsProviderProps>) => {
  useEffect(() => {
    analytics?.initialize();
  }, [analytics]);

  return <AnalyticsContext.Provider value={analytics}>{children}</AnalyticsContext.Provider>;
};

export const useAnalytics = () => {
  return useContext(AnalyticsContext);
};
