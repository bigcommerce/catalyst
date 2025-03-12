'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const GTM_ID = 'GTM-KGQLWDKB';

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
