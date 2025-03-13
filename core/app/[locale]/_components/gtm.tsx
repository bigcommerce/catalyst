'use client';

import { useEffect } from 'react';

import { usePathname } from '~/i18n/routing';

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || '';

declare global {
  interface Window {
    dataLayer: Array<Record<string, unknown>>;
  }
}

export default function GTM() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || [];

      function gtag(...args: any) {
        window.dataLayer.push(args);
      }

      gtag('js', new Date());
      gtag('config', GTM_ID, {
        page_path: pathname,
      });
    }
  }, [pathname]);

  return null;
}
