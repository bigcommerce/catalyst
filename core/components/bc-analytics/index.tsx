'use client';

import { useEffect } from 'react';
import { AnalyticsEvent } from '@bigcommerce/analytics';
import { useAnalytics } from '~/app/contexts/analytics-context';

interface BcAnalyticsProps {
  event: AnalyticsEvent;
}

export function BcAnalytics({ event }: BcAnalyticsProps) {
  const analytics = useAnalytics();

  useEffect(() => {
    analytics.init();
    analytics.trackEvent(event);
  }, [event]);

  return null;
}
