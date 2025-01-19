'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function SiteVibesIntegration() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 10;

    const initSiteVibes = () => {
      if (typeof window !== 'undefined' && window.SiteVibesEvents && typeof window.SiteVibesEvents.pageRefresh === 'function') {
        window.SiteVibesEvents.pageRefresh();
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(initSiteVibes, 500);
      } else {
        console.error('Failed to initialize SiteVibes after multiple attempts');
      }
    }

    initSiteVibes();

    const handleRouteChange = () => {
      if (typeof window !== 'undefined' && window.SiteVibesEvents && typeof window.SiteVibesEvents.pageRefresh === 'function') {
        window.SiteVibesEvents.pageRefresh();
      }
    }

    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    }
  }, [pathname, searchParams]);

  return null;
}