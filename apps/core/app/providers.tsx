'use client';

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { PropsWithChildren } from 'react';

import { CompareProductsProvider } from '~/app/contexts/compare-products-context';

const ANALYTICS_SESSION_STORAGE_KEY = 'analyticsEnabled';

const ANALYTICS_SAMPLE_RATE = process.env.NEXT_PUBLIC_ANALYTICS_SAMPLE_RATE
  ? Number.parseFloat(process.env.NEXT_PUBLIC_ANALYTICS_SAMPLE_RATE)
  : 0.25;

const SPEED_INSIGHTS_SAMPLE_RATE = process.env.NEXT_PUBLIC_SPEED_INSIGHTS_SAMPLE_RATE
  ? Number.parseFloat(process.env.NEXT_PUBLIC_SPEED_INSIGHTS_SAMPLE_RATE)
  : 0.25;

function isAnalyticsEnabled() {
  try {
    let analyticsEnabled = sessionStorage.getItem(ANALYTICS_SESSION_STORAGE_KEY);

    if (analyticsEnabled === null) {
      if (Math.random() <= ANALYTICS_SAMPLE_RATE) {
        analyticsEnabled = '1';
      } else {
        analyticsEnabled = '0';
      }

      sessionStorage.setItem(ANALYTICS_SESSION_STORAGE_KEY, analyticsEnabled);
    }

    return analyticsEnabled === '1';
  } catch {
    return false;
  }
}

export function Providers({ children }: PropsWithChildren) {
  return (
    <>
      <CompareProductsProvider>{children}</CompareProductsProvider>
      <Analytics beforeSend={(event) => (isAnalyticsEnabled() ? event : null)} />
      <SpeedInsights sampleRate={SPEED_INSIGHTS_SAMPLE_RATE} />
    </>
  );
}
