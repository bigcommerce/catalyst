'use client';

import { useCallback, useEffect } from 'react';

export const SessionSyncProvider = () => {
  const handleBrowserBackButtonEvent = useCallback((event: PageTransitionEvent) => {
    if (event.persisted) {
      try {
        const previousOrigin = new URL(document.referrer).origin;

        if (previousOrigin !== window.location.origin) {
          window.location.reload();
        }
      } catch (error) {
        console.error('Error parsing document.referrer:', error);
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('pageshow', handleBrowserBackButtonEvent);

    return () => {
      window.removeEventListener('pageshow', handleBrowserBackButtonEvent);
    };
  }, [handleBrowserBackButtonEvent]);

  return null;
};
