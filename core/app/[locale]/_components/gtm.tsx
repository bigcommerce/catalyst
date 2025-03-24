'use client';

import { useEffect } from 'react';

import { usePathname } from '~/i18n/routing';

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || '';

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown> | [string, ...unknown[]]>;
  }
}

type GtagArgs = ['js', Date] | ['config', string, Record<string, unknown>];

function gtag(...args: GtagArgs) {
  if (window.dataLayer) window.dataLayer.push(args);
}

export default function GTM() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!window.dataLayer) {
        window.dataLayer = [];
      }

      gtag('js', new Date());
      gtag('config', GTM_ID, {
        page_path: pathname,
      });
    }
  }, [pathname]);

  return null;
}
