'use client';

import { useEffect } from 'react';

import { useVisitorId } from '~/hooks/use-visitor-id';
import { trackHomePageView } from '~/lib/vertex-ga4/events';

/**
 * Client component to track home page views with GA4 (Vertex AI compatible)
 */
export function HomePageTracker() {
  const visitorId = useVisitorId();

  useEffect(() => {
    if (visitorId) {
      trackHomePageView(visitorId);
    }
  }, [visitorId]);

  return null;
}
